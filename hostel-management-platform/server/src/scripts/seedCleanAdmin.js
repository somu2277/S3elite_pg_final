require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({ role: 'owner' });
    await User.deleteMany({ email: { $in: ['admin@s3elite.com', 'shiva@s3elite.in', 'shiva@smartpg.com'] } });

    await User.create({
      name: 'Shiva (PG Owner)',
      email: 'admin@s3elite.com',
      password: 'adminpassword123',
      role: 'owner',
      phone: '9494211015'
    });

    await User.create({
      name: 'Shiva (PG Owner)',
      email: 'shiva@s3elite.in',
      password: 'adminpassword123',
      role: 'owner',
      phone: '9494211015'
    });

    console.log('Successfully seeded admin users!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admins:', err);
    process.exit(1);
  }
};

seed();
