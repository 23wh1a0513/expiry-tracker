const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expiry-tracker';

const itemSchema = new mongoose.Schema({ name: String, expiryDate: Date });
const Item = mongoose.model('Item', itemSchema);

async function run() {
  await mongoose.connect(mongoURI);
  console.log('Connected to', mongoURI);
  // create a test item
  await Item.create({ name: 'DirectTestFromScript', expiryDate: new Date('2026-03-01') });
  const items = await Item.find().lean();
  console.log('Items in DB:', JSON.stringify(items, null, 2));
  await mongoose.disconnect();
  console.log('Disconnected');
}

run().catch(err => {
  console.error('DB test error:', err);
  process.exit(1);
});
