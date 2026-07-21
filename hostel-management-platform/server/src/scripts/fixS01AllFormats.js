require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Bed = require('../models/Bed');

const fixAllS01 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete any bed matching S01 (case insensitive, trimmed)
    const allBeds = await Bed.find();
    const s01BedIds = allBeds
      .filter(b => b.roomNumber && b.roomNumber.toString().trim().toUpperCase() === 'S01')
      .map(b => b._id);

    console.log(`Found ${s01BedIds.length} beds matching S01 in MongoDB.`);
    
    if (s01BedIds.length > 0) {
      await Bed.deleteMany({ _id: { $in: s01BedIds } });
      console.log(`Successfully deleted all ${s01BedIds.length} old beds for S01.`);
    }

    // Insert exactly 6 clean beds for S01
    const newBeds = [1, 2, 3, 4, 5, 6].map(num => ({
      roomNumber: 'S01',
      bedNumber: num,
      floorName: 'Ground Floor',
      occupied: false,
      reservationStatus: 'Available',
      maintenanceStatus: 'Functional',
      rentPerBed: 5500
    }));

    await Bed.insertMany(newBeds);
    console.log('Inserted exactly 6 fresh beds for S01 (Cot 1, Cot 2, Cot 3, Cot 4, Cot 5, Cot 6).');

    // Update Room S01
    await Room.deleteMany({ roomNumber: { $regex: /s01/i } });
    await Room.create({
      roomNumber: 'S01',
      floor: 0,
      floorName: 'Ground Floor',
      capacity: 6,
      rentPerBed: 5500,
      type: 'AC',
      status: 'Available'
    });
    console.log('Updated Room S01 record to 6 Sharing.');

    process.exit(0);
  } catch (err) {
    console.error('Error fixing S01:', err);
    process.exit(1);
  }
};

fixAllS01();
