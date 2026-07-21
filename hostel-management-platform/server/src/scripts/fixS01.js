require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Bed = require('../models/Bed');

const fixS01 = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is missing in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Delete existing beds for S01
    const deleteResult = await Bed.deleteMany({ roomNumber: 'S01' });
    console.log(`Deleted ${deleteResult.deletedCount} existing beds for S01`);

    // 2. Re-create exactly 6 beds for S01
    const newBeds = [];
    for (let i = 1; i <= 6; i++) {
      newBeds.push({
        roomNumber: 'S01',
        bedNumber: i,
        floorName: 'Ground Floor',
        occupied: false,
        reservationStatus: 'Available',
        maintenanceStatus: 'Functional',
        rentPerBed: 5500
      });
    }
    await Bed.insertMany(newBeds);
    console.log('Successfully created 6 unique beds (Cot 1 to Cot 6) for S01');

    // 3. Update Room S01 capacity to 6
    await Room.findOneAndUpdate(
      { roomNumber: 'S01' },
      {
        roomNumber: 'S01',
        floor: 0,
        floorName: 'Ground Floor',
        capacity: 6,
        rentPerBed: 5500,
        type: 'AC',
        status: 'Available'
      },
      { upsert: true }
    );
    console.log('Successfully updated Room S01 to 6 Sharing on Ground Floor');

    process.exit(0);
  } catch (err) {
    console.error('Error fixing S01 beds:', err);
    process.exit(1);
  }
};

fixS01();
