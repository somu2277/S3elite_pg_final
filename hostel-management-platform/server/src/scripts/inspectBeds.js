require('dotenv').config();
const mongoose = require('mongoose');
const Bed = require('../models/Bed');

const inspect = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const beds = await Bed.find();
  console.log('Total beds in DB:', beds.length);
  const s01Beds = beds.filter(b => b.roomNumber && b.roomNumber.toLowerCase().includes('s01'));
  console.log('Found S01 beds:', s01Beds.map(b => ({ id: b._id, roomNumber: b.roomNumber, bedNumber: b.bedNumber })));
  process.exit(0);
};

inspect();
