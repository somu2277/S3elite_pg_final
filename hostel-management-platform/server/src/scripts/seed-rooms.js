require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');

const roomData = [
  // Ground Floor
  { roomNumber: 'S01', floor: 0, capacity: 6, rentPerBed: 5500 },
  { roomNumber: 'S02', floor: 0, capacity: 6, rentPerBed: 5500 },

  // 1st Floor
  { roomNumber: 'S11', floor: 1, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S12', floor: 1, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S13', floor: 1, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S14', floor: 1, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S15', floor: 1, capacity: 5, rentPerBed: 5500 },
  { roomNumber: 'S16', floor: 1, capacity: 5, rentPerBed: 5500 },
  { roomNumber: 'S17', floor: 1, capacity: 5, rentPerBed: 5500 },
  { roomNumber: 'S18', floor: 1, capacity: 5, rentPerBed: 5500 },

  // 2nd Floor
  { roomNumber: 'S21', floor: 2, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S22', floor: 2, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S23', floor: 2, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S24', floor: 2, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S25', floor: 2, capacity: 5, rentPerBed: 5500 },
  { roomNumber: 'S26', floor: 2, capacity: 5, rentPerBed: 5500 },
  { roomNumber: 'S27', floor: 2, capacity: 5, rentPerBed: 5500 },
  { roomNumber: 'S28', floor: 2, capacity: 5, rentPerBed: 5500 },

  // 3rd Floor
  { roomNumber: 'S31', floor: 3, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S32', floor: 3, capacity: 4, rentPerBed: 6000 },
  { roomNumber: 'S33', floor: 3, capacity: 5, rentPerBed: 5500 },
  { roomNumber: 'S34', floor: 3, capacity: 5, rentPerBed: 5500 }
];

async function seedRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing rooms to prevent duplicates
    await Room.deleteMany({});
    console.log('Cleared existing rooms');

    // Insert new rooms
    await Room.insertMany(roomData);
    console.log(`Successfully seeded ${roomData.length} rooms`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  }
}

seedRooms();
