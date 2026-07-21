require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Bed = require('../models/Bed');

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Room.deleteMany({});
    await Bed.deleteMany({});
    console.log('Cleared all rooms and beds');

    mongoose.disconnect();
  } catch (error) {
    console.error('Error clearing db:', error);
    process.exit(1);
  }
}

clearDB();
