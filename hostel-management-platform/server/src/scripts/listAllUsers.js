require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const list = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({ role: 'owner' }).select('+password');
  console.log('Owners in DB:', users.map(u => ({ id: u._id, email: u.email, role: u.role, password: u.password })));
  
  // Also check if admin@s3elite.com password matches adminpassword123
  const testUser = await User.findOne({ email: 'admin@s3elite.com' }).select('+password');
  if (testUser) {
    const isMatch = await testUser.matchPassword('adminpassword123');
    console.log('Password match test for adminpassword123:', isMatch);
  }
  process.exit(0);
};

list();
