require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const check = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const userByEmail = await User.findOne({ email: 'admin@s3elite.com' });
  console.log('User found by email only:', userByEmail);
  const allUsers = await User.find();
  console.log('All users in DB:', allUsers.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
};

check();
