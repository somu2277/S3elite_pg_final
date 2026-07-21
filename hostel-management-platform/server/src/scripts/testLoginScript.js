require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'admin@s3elite.com';
    const cleanEmail = email.trim().toLowerCase();
    const password = 'adminpassword123';

    console.log('cleanEmail:', cleanEmail);
    const adminUser = await User.findOne({ email: cleanEmail }).select('+password');
    console.log('adminUser found:', !!adminUser);
    if (adminUser) {
      console.log('adminUser.role:', adminUser.role);
      console.log('adminUser.password in DB:', adminUser.password);
      const match = await adminUser.matchPassword(password);
      console.log('match result:', match);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

test();
