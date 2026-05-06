# 🎯 TrackMyExpiry AI - Complete Application

## 📦 About

TrackMyExpiry AI is a modern, intelligent expiry date tracking application that helps you manage your inventory, reduce food waste, and make smarter purchasing decisions.

## ✨ Key Features

### 1. Dashboard
- **Stats Overview**: Total, Safe, Warning, and Expired items at a glance
- **Quick Actions**: Add items or refresh instantly
- **Status Indicators**: Color-coded items for quick identification

### 2. My Items (Tab)
- Grid view of all active items
- Color-coded by expiry status
- Days until expiry clearly displayed
- Items automatically sorted by status

### 3. Expired Items (Tab) ✕
- View all expired products
- Shows how long they've been expired
- Delete/remove items with one click
- Helps maintain clean inventory

### 4. Planner (Tab) 📅
- Smart scheduling of consumption
- Items grouped by expiry date
- Urgency indicators (Green/Orange/Red)
- Mark items as consumed
- Plan your meals and usage

### 5. Risk Check (Tab) 🔍
- Analyze purchase history for any product
- Risk assessment: Low/Medium/High
- Statistics on average shelf life
- Make informed purchasing decisions
- View historical expiry patterns

### 6. AI Chat (Tab) 💬
- Ask questions about your inventory
- "What's expiring soon?" - Get instant lists
- "Risk of [product]" - Get risk analysis
- Natural language understanding
- Context-aware responses

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- MongoDB running locally (mongodb://127.0.0.1:27017)
- Modern web browser

### Installation

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the server**:
```bash
npm start
```

Server will run at: `http://localhost:3000`

### Usage

1. **Open in browser**: `http://localhost:3000`
2. **Add items**: Click "+ ADD ITEM" button
3. **View dashboard**: Monitor all items and stats
4. **Use tabs**: Switch between different views
5. **Interact**: Add, view, plan, and analyze

## 📋 How to Add Items

**Method 1: Modal Dialog**
1. Click "+ ADD ITEM" button on Dashboard
2. Fill in item name
3. Select expiry date
4. Click "Add Item"

**Method 2: Add Item Page**
1. Click "Add Item" in navigation
2. Use form to add items
3. Items save to database instantly

## 💾 Database

- **Type**: MongoDB
- **Database**: `expiry-tracker`
- **Collection**: `items`
- **Schema**:
  ```javascript
  {
    _id: ObjectId,
    name: String,
    expiryDate: Date,
    expired: Boolean
  }
  ```

## 🎨 UI Design

- **Modern & Clean**: Professional interface
- **Color-Coded**: Easy status recognition
- **Responsive**: Desktop, tablet, mobile support
- **Smooth Animations**: Engaging interactions
- **Accessibility**: Clear labels and icons

### Color Scheme
- 🟢 **Green (Success)**: Safe items (4+ days)
- 🟡 **Orange (Warning)**: Expiring soon (1-3 days)
- 🔴 **Red (Danger)**: Expired items

## 🔧 API Endpoints

### Items Management
```
POST   /items              - Add new item
GET    /items              - Get all active items
GET    /items?includeExpired=true  - Get all items
GET    /items/expired      - Get only expired items
DELETE /items/:id          - Remove item
```

### Planner & Analytics
```
GET    /planner            - Get schedule grouped by date
GET    /items/soon?days=3  - Items expiring within days
GET    /risk?name=product  - Risk analysis for product
```

### Chat
```
POST   /chat               - Send message to AI assistant
```

## 📱 Browser Support

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Architecture**: RESTful API

## 📊 Project Structure

```
expiry-tracker/
├── frontend/
│   ├── index.html        - Dashboard (main page)
│   ├── add.html          - Add item form
│   ├── planner.html      - Planner page
│   ├── chat.html         - Chat page
│   ├── style.css         - Styling
│   └── login.html        - Login (placeholder)
├── backend/
│   ├── app.js            - Express server
│   ├── db_test.js        - Database test
│   ├── package.json      - Dependencies
│   └── .env              - Environment config
└── README.md             - This file
```

## ⚙️ Configuration

### Environment Variables (.env)
```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/expiry-tracker
```

### Server Features
- Automatic expiry checking (every 6 hours)
- Graceful shutdown
- Request logging
- CORS enabled
- MongoDB connection management

## 🔄 Automatic Features

- **Auto-Expiry**: Items automatically marked as expired when date passes
- **Scheduler**: Background task marks expired items every 6 hours
- **Auto-Sync**: Frontend automatically refreshes data
- **Instant Updates**: Items update immediately after add/delete

## 💡 Tips & Tricks

1. **Bulk Add**: Use AI Chat to ask "What should I buy?" for suggestions
2. **Risk Planning**: Use Risk Check before buying recurring products
3. **Smart Planner**: Check Planner daily to plan consumption
4. **Expired Cleanup**: Regularly check Expired Items tab and remove old items
5. **Dashboard Watch**: Keep tabs on expiring items from dashboard stats

## 🐛 Troubleshooting

### Items not appearing
- Check server is running: `npm start`
- Verify MongoDB is running
- Refresh browser page

### Add Item not working
- Check console for errors (F12)
- Ensure server is responding: Check terminal output
- Try adding from Add Item page directly

### Database connection failed
- Verify MongoDB is installed and running
- Check connection string in `.env`
- Try: `mongod` in another terminal

## 📞 Support

For issues or suggestions, check the terminal logs for error messages.

## 🎉 Ready to Use!

Your expiry tracker is now ready. Start adding items and never waste food again!

**Server Running**: http://localhost:3000
**Database**: expiry-tracker
**Status**: ✅ Active

---

**Created**: January 22, 2026
**Version**: 1.0.0
**Status**: Production Ready
