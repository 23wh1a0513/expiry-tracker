const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const nodemailer = require('nodemailer');
require('dotenv').config();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Setup nodemailer for email reminders
const emailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASS || ''
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection (use MONGO_URI env var, fallback to local)
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expiry-tracker';

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB:', mongoURI))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to', mongoose.connection.host);
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Define Item schema and model
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notifiedAt: { type: Date, default: null }
});

// track if an item has been marked expired by the server
itemSchema.add({ expired: { type: Boolean, default: false } });
const Item = mongoose.model('Item', itemSchema);

// User model (kept in models/User.js)
const User = require('./models/User');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

// Sessions (simple in-memory store for demo; use a persistent store in production)
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Simple request logger for debugging
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length) console.log('[BODY]', req.body);
    next();
});

// Simple auth middleware
function requireLogin(req, res, next) {
    if (req.session && req.session.userId) return next();
    return res.status(401).json({ message: 'Not authenticated' });
}

// Serve frontend static files (expects frontend/ at repository root)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Route to add an item
app.post('/items', requireLogin, async (req, res) => {
    try {
        const { name, expiryDate } = req.body;
        const owner = req.session.userId;
        const newItem = new Item({ name, expiryDate, owner });
        await newItem.save();
        res.status(201).json({ message: 'Item added successfully', item: newItem });
    } catch (error) {
        if (error && error.name === 'ValidationError') {
            const details = Object.keys(error.errors || {}).reduce((acc, k) => {
                acc[k] = error.errors[k].message;
                return acc;
            }, {});
            return res.status(400).json({ message: 'Validation failed', details });
        }
        console.error('Error adding item:', error);
        res.status(500).json({ message: 'Error adding item' });
    }
});

// Route to get all items
app.get('/items', requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const includeExpired = req.query.includeExpired === 'true';
        const base = { owner: userId };
        const query = includeExpired ? base : { ...base, expired: false };
        const items = await Item.find(query);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving items', error });
    }
});

// return only expired items
app.get('/items/expired', requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const items = await Item.find({ expired: true, owner: userId });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving expired items' });
    }
});

// delete an item (mark consumed)
app.delete('/items/:id', requireLogin, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const itm = await Item.findById(id);
        if (!itm) return res.status(404).json({ message: 'Item not found' });
        if (!itm.owner || itm.owner.toString() !== userId) return res.status(403).json({ message: 'Not allowed' });
        await Item.findByIdAndDelete(id);
        res.status(200).json({ message: 'Item removed' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting item' });
    }
});

// ===== Authentication routes =====
// Register a new user
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ message: 'username and password required' });
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ message: 'Username already exists' });
        const hash = await bcryptjs.hash(password, 10);
        const user = new User({ username, passwordHash: hash });
        await user.save();
        req.session.userId = user._id;
        req.session.username = user.username;
        res.status(201).json({ message: 'User registered', username: user.username });
    } catch (err) {
        console.error('Register error', err);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ message: 'username and password required' });
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const ok = await bcryptjs.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
        req.session.userId = user._id;
        req.session.username = user.username;
        res.json({ message: 'Logged in', username: user.username });
    } catch (err) {
        console.error('Login error', err);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Error logging out' });
        res.json({ message: 'Logged out' });
    });
});

// Current user
app.get('/me', (req, res) => {
    if (req.session && req.session.userId) return res.json({ username: req.session.username, email: req.session.userEmail || '' });
    res.status(401).json({ message: 'Not logged in' });
});

// Update email for alerts
app.post('/me/email', requireLogin, async (req, res) => {
    try {
        const { email } = req.body || {};
        if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Email required' });
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.email = email;
        await user.save();
        res.json({ message: 'Email updated', email });
    } catch (err) {
        console.error('Email update error', err);
        res.status(500).json({ message: 'Error updating email' });
    }
});

// Smart planner: simple greedy schedule grouped by day
app.get('/planner', async (req, res) => {
    try {
        const userId = req.session && req.session.userId;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const items = await Item.find({
            expired: false,
            owner: userId,
            expiryDate: { $gte: now }
        }).sort({ expiryDate: 1 });

        const planMap = {};
        items.forEach(it => {
            const d = new Date(it.expiryDate);
            const iso = d.toISOString().slice(0,10);
            if (!planMap[iso]) planMap[iso] = [];
            planMap[iso].push({ _id: it._id, name: it.name, expiryDate: it.expiryDate });
        });
        const plan = Object.keys(planMap).sort().map(date => ({ date, items: planMap[date] }));
        res.status(200).json(plan);
    } catch (err) {
        console.error('Planner error', err);
        res.status(500).json({ message: 'Error generating planner' });
    }
});

// items expiring within next `days` days (default 3)
app.get('/items/soon', requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const days = parseInt(req.query.days || '3', 10);
        const now = new Date();
        const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const items = await Item.find({ expired: false, owner: userId, expiryDate: { $lte: cutoff } }).sort({ expiryDate: 1 });
        res.status(200).json(items);
    } catch (err) {
        console.error('Error fetching soon items', err);
        res.status(500).json({ message: 'Error fetching soon items' });
    }
});

// Risk estimation for purchase
app.get('/risk', async (req, res) => {
    try {
        const name = (req.query.name || '').trim();
        if (!name) return res.status(400).json({ message: 'name query required' });
        const regex = new RegExp(name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'i');
        const userId = req.session && req.session.userId;
        const filter = userId ? { name: regex, owner: userId } : { name: regex };
        const items = await Item.find(filter);
        if (!items || items.length === 0) return res.json({ count: 0, risk: 'unknown', details: null });
        const now = new Date();
        const stats = items.map(it => {
            const days = Math.ceil((new Date(it.expiryDate) - now) / (1000*60*60*24));
            return { id: it._id, days, expired: it.expired };
        });
        const count = stats.length;
        const expiredCount = stats.filter(s => s.days < 0 || s.expired).length;
        const within7 = stats.filter(s => s.days <= 7 && s.days >= 0).length;
        const avgDays = Math.round(stats.reduce((a,b)=>a+b.days,0)/count);
        let risk = 'low';
        if (expiredCount / count > 0.3 || within7 / count > 0.4 || avgDays < 7) risk = 'high';
        else if (within7 / count > 0.15 || avgDays < 21) risk = 'medium';
        res.json({ count, expiredCount, within7, avgDays, risk, examples: stats.slice(0,5) });
    } catch (err) {
        console.error('Risk error', err);
        res.status(500).json({ message: 'Error computing risk' });
    }
});

// Chat endpoint with OpenAI integration
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body || {};
        console.log('[CHAT] message=', message);
        if (!message) return res.status(400).json({ reply: 'Please send a message.' });
        const msg = message.toLowerCase();
        const userId = req.session && req.session.userId;
        
        // Priority checks for inventory-related questions
        if (msg.includes('expiring') || msg.includes('soon') || msg.includes('about to expire') || msg.includes('expiry') || msg.includes('expire') || msg.includes('going to expire')) {
            console.log('[CHAT] matched expiry branch');
            const daysMatch = msg.match(/(\d+)\s*day/);
            const days = daysMatch ? parseInt(daysMatch[1],10) : 3;
            const now = new Date();
            const cutoff = new Date(now.getTime() + days*24*60*60*1000);
            const chatFilter = userId ? { expired: false, expiryDate: { $lte: cutoff }, owner: userId } : { expired: false, expiryDate: { $lte: cutoff } };
            const items = await Item.find(chatFilter).limit(20).sort({ expiryDate:1 });
            if (!items || items.length === 0) return res.json({ reply: `No items expiring in the next ${days} day(s).` });
            const list = items.map(it => `${it.name} (expires ${new Date(it.expiryDate).toLocaleDateString()})`).join('\n');
            return res.json({ reply: `Items expiring within ${days} day(s):\n${list}` });
        }
        
        if (msg.includes('list') && (msg.includes('all') || msg.includes('items') || msg.includes('inventory'))) {
            if (!userId) return res.json({ reply: 'Please log in to view your items.' });
            const items = await Item.find({ owner: userId, expired: false }).limit(20);
            if (!items || items.length === 0) return res.json({ reply: 'You have no items in your inventory.' });
            const list = items.map(it => `${it.name} (expires ${new Date(it.expiryDate).toLocaleDateString()})`).join('\n');
            return res.json({ reply: `Your items:\n${list}` });
        }
        
        if (msg.startsWith('risk of') || msg.startsWith('will') || msg.includes('risk')) {
            const m = msg.match(/(?:risk of|risk for|risk|will)\s+(?:a\s+)?(.+)/i);
            const name = m ? m[1] : msg;
            const resp = await fetchRisk(name, userId);
            const itemName = name.toLowerCase();
            let additionalAdvice = '';
            if (itemName.includes('milk') || itemName.includes('dairy')) {
                additionalAdvice = '\n💡 Dairy spoils quickly - check smell and appearance before using.';
            } else if (itemName.includes('meat') || itemName.includes('chicken') || itemName.includes('fish')) {
                additionalAdvice = '\n💡 Protein foods can harbor bacteria - cook to safe temperatures.';
            } else if (itemName.includes('vegetable') || itemName.includes('fruit')) {
                additionalAdvice = '\n💡 Produce wilts but is usually safe past expiry - check for mold.';
            } else if (itemName.includes('bread') || itemName.includes('bakery')) {
                additionalAdvice = '\n💡 Bread gets stale but is rarely dangerous - check for mold.';
            }
            return res.json({ reply: `Risk for "${name}": ${resp.risk}. Average days until expiry: ${resp.avgDays}. (${resp.count} samples)${additionalAdvice}` });
        }
        
        if (msg.includes('expired') && (msg.includes('show') || msg.includes('what') || msg.includes('have'))) {
            if (!userId) return res.json({ reply: 'Please log in to view expired items.' });
            const expiredItems = await Item.find({ expired: true, owner: userId }).sort({ expiryDate: -1 });
            if (!expiredItems || expiredItems.length === 0) return res.json({ reply: 'You have no expired items.' });
            const list = expiredItems.map(it => `${it.name} (expired ${new Date(it.expiryDate).toLocaleDateString()})`).join('\n');
            return res.json({ reply: `Your expired items:\n${list}` });
        }

        if (msg.includes('plan') || msg.includes('schedule') || msg.includes('planner')) {
            if (!userId) return res.json({ reply: 'Please log in to view your planner.' });
            const items = await Item.find({ expired: false, owner: userId }).sort({ expiryDate: 1 });
            if (!items || items.length === 0) return res.json({ reply: 'No items to plan for.' });
            const planMap = {};
            items.forEach(it => {
                const d = new Date(it.expiryDate);
                const iso = d.toISOString().slice(0,10);
                if (!planMap[iso]) planMap[iso] = [];
                planMap[iso].push(it.name);
            });
            const plan = Object.keys(planMap).sort().slice(0,7).map(date => 
                `${new Date(date).toLocaleDateString()}: ${planMap[date].join(', ')}`
            ).join('\n');
            return res.json({ reply: `Your consumption plan:\n${plan}` });
        }

        // High priority: Snacks and substitutes
        if (msg.includes('snack')) {
            return res.json({ reply: `Healthy snack ideas:\n- Fresh fruit (apples, bananas, berries)\n- Yogurt with nuts\n- Vegetable sticks with hummus\n- Cheese and whole grain crackers\n- Trail mix\n- Popcorn` });
        }

        if (msg.includes('substitute') || msg.includes('instead of')) {
            return res.json({ reply: `Common substitutes:\n- Instead of butter: olive oil, applesauce\n- Instead of milk: almond milk, oat milk\n- Instead of eggs: flaxseed mixture\n- Instead of sugar: honey, maple syrup\n- Instead of flour: almond flour` });
        }

        if (msg.includes('cook') || msg.includes('recipe') || msg.includes('what should i cook') || msg.includes('what can i cook')) {
            console.log('[CHAT] matched cooking branch');
            if (userId) {
                const items = await Item.find({ owner: userId, expired: false }).limit(10).sort({ expiryDate: 1 });
                if (items && items.length > 0) {
                    const itemList = items.map(it => it.name).join(', ');
                    return res.json({ reply: `Try using items like ${itemList}. Simple ideas: omelette, pasta with vegetables, grilled sandwiches, or a salad with fresh produce.` });
                }
            }
            return res.json({ reply: `Try simple meals like omelette, pasta, stir-fry, salad, or sandwiches. Use what you have on hand and check expiry dates before cooking.` });
        }

        // Default: Route all other questions to OpenAI if configured
        if (openai) {
            console.log('[CHAT] using OpenAI fallback');
            const aiReply = await generateOpenAIReply(message, userId);
            return res.json({ reply: aiReply });
        }

        // Local fallback when OpenAI key is missing/unavailable
        const lower = msg.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return res.json({ reply: 'Hello! I can help you track expiring items, suggest recipes, and answer basic expiry questions.' });
        }
        if (lower.includes('help') || lower.includes('how') || lower.includes('can you')) {
            return res.json({ reply: 'Ask me things like "What items are expiring soon?", "Show my inventory", or "Risk of milk".' });
        }
        if (lower.includes('thank') || lower.includes('thanks')) {
            return res.json({ reply: 'You are welcome! Glad to help.' });
        }

        return res.json({ reply: "I'm your Expiry Tracker assistant! I can help with inventory management, recipes, cooking advice, and more. Please set OPENAI_API_KEY for full AI answers." });
    } catch (err) {
        console.error('Chat error', err);
        res.status(500).json({ reply: 'Error processing message' });
    }
});

// Helper function for risk assessment
async function fetchRisk(name, userId) {
    if (!name) return { risk: 'unknown', count: 0, avgDays: 0 };
    const regex = new RegExp(name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i');
    const filter = userId ? { name: regex, owner: userId } : { name: regex };
    const items = await Item.find(filter);
    if (!items || items.length === 0) return { risk: 'unknown', count: 0, avgDays: 0 };
    const now = new Date();
    const stats = items.map(it => Math.ceil((new Date(it.expiryDate) - now) / (1000*60*60*24)));
    const avgDays = Math.round(stats.reduce((a,b)=>a+b,0)/stats.length);
    let risk = 'low';
    if (avgDays < 7) risk = 'high'; else if (avgDays < 21) risk = 'medium';
    return { risk, count: items.length, avgDays };
}

// Helper function for OpenAI integration
async function generateOpenAIReply(message, userId) {
    if (!openai) return "I'm your Expiry Tracker assistant! I can help with recipes, meal planning, storage tips, and more.";

    try {
        const userItems = userId ? await Item.find({ owner: userId, expired: false }).limit(20) : [];
        const inventoryText = userItems.length
            ? `User's current inventory:\n${userItems.slice(0, 10).map(i => `- ${i.name} (expires ${new Date(i.expiryDate).toLocaleDateString()})`).join('\n')}`
            : 'User has no items in inventory.';

        const systemPrompt = `You are a helpful assistant for an expiry tracking app. Help users manage their food, reduce waste, and get recipe ideas. Keep responses concise and practical.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `${inventoryText}\n\nUser question: ${message}` }
            ],
            max_tokens: 200,
            temperature: 0.7
        });
        
        const reply = completion.choices?.[0]?.message?.content?.trim() || completion.choices?.[0]?.text?.trim();
        return reply || "I couldn't generate a response. Try asking about specific recipes or ingredients.";
    } catch (err) {
        console.error('OpenAI error:', err);
        const code = err?.code || err?.error?.code || err?.status;
        if (code === 'insufficient_quota' || code === 'rate_limit_exceeded' || code === 429) {
            return localChatFallback(message, userId);
        }
        return "I'm having trouble reaching the AI service. Try asking something simpler or check your connection.";
    }
}

async function localChatFallback(message, userId) {
    const msg = message.toLowerCase();
    if (msg.includes('expiring') || msg.includes('soon') || msg.includes('about to expire') || msg.includes('expiry') || msg.includes('expire') || msg.includes('going to expire')) {
        const daysMatch = msg.match(/(\d+)\s*day/);
        const days = daysMatch ? parseInt(daysMatch[1],10) : 3;
        const now = new Date();
        const cutoff = new Date(now.getTime() + days*24*60*60*1000);
        const chatFilter = userId ? { expired: false, expiryDate: { $lte: cutoff }, owner: userId } : { expired: false, expiryDate: { $lte: cutoff } };
        const items = await Item.find(chatFilter).limit(20).sort({ expiryDate:1 });
        if (!items || items.length === 0) return `No items expiring in the next ${days} day(s).`;
        return `Items expiring within ${days} day(s):\n${items.map(it => `${it.name} (expires ${new Date(it.expiryDate).toLocaleDateString()})`).join('\n')}`;
    }
    if (msg.includes('cook') || msg.includes('recipe') || msg.includes('what should i cook') || msg.includes('what can i cook')) {
        if (userId) {
            const items = await Item.find({ owner: userId, expired: false }).limit(10).sort({ expiryDate: 1 });
            if (items && items.length > 0) {
                const itemList = items.map(it => it.name).join(', ');
                return `Try using items like ${itemList}. Simple ideas: omelette, pasta with vegetables, grilled sandwiches, or a salad with fresh produce.`;
            }
        }
        return 'Try simple meals like omelette, pasta, stir-fry, salad, or sandwiches. Use what you have on hand and check expiry dates before cooking.';
    }
    if (msg.startsWith('risk of') || msg.startsWith('will') || msg.includes('risk')) {
        const m = msg.match(/(?:risk of|risk for|risk|will)\s+(?:a\s+)?(.+)/i);
        const name = m ? m[1] : msg;
        const resp = await fetchRisk(name, userId);
        return `Risk for "${name}": ${resp.risk}. Average days until expiry: ${resp.avgDays}. (${resp.count} samples)`;
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return 'Hello! I can help you track expiring items, suggest recipes, and answer basic expiry questions.';
    }
    if (msg.includes('help') || msg.includes('how') || msg.includes('can you')) {
        return 'Ask me things like "What items are expiring soon?", "Show my inventory", or "Risk of milk".';
    }
    if (msg.includes('thank') || msg.includes('thanks')) {
        return 'You are welcome! Glad to help.';
    }
    return "AI service quota has been exceeded or rate limited. I can still answer basic inventory and expiry questions without OpenAI.";
}

// Scheduler to mark items as expired
async function sendExpiryEmailReminders() {
    try {
        const now = new Date();
        const soon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
        const items = await Item.find({ expired: false, expiryDate: { $lte: soon }, notifiedAt: null }).populate('owner');

        const byUser = {};
        items.forEach(item => {
            const uid = item.owner?._id?.toString();
            if (!uid || !item.owner || !item.owner.email) return;
            if (!byUser[uid]) byUser[uid] = { user: item.owner, items: [] };
            byUser[uid].items.push(item);
        });

        for (const uid in byUser) {
            const { user, items } = byUser[uid];
            if (!user.email) continue;
            const list = items.map(it => `- ${it.name} (expires ${new Date(it.expiryDate).toLocaleDateString()})`).join('\n');
            const mailOptions = {
                from: process.env.MAIL_FROM || 'Expiry Tracker <noreply@example.com>',
                to: user.email,
                subject: 'Expiry Tracker: Items expiring soon',
                text: `You have ${items.length} item(s) expiring soon:\n${list}`
            };
            try {
                await emailTransporter.sendMail(mailOptions);
                console.log(`Sent expiry email to ${user.email}`);
                await Item.updateMany({ _id: { $in: items.map(i => i._id) } }, { $set: { notifiedAt: new Date() } });
            } catch (err) {
                console.error(`Failed to send email to ${user.email}`, err);
            }
        }
    } catch (err) {
        console.error('Error in sendExpiryEmailReminders:', err);
    }
}

async function markExpiredItems() {
    try {
        const now = new Date();
        const res = await Item.updateMany({ expiryDate: { $lt: now }, expired: false }, { $set: { expired: true } });
        if (res && res.modifiedCount) console.log(`Marked ${res.modifiedCount} items as expired`);
    } catch (err) {
        console.error('Error marking expired items:', err);
    }
}

// Start scheduler and server
async function runScheduledTasks() {
    await markExpiredItems();
    await sendExpiryEmailReminders();
}

runScheduledTasks();
setInterval(runScheduledTasks, 1000 * 60 * 60 * 6); // Every 6 hours

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
