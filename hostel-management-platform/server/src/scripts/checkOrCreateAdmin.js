require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkOrCreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ role: 'owner' });

    if (admin) {
      console.log('Existing Admin found:');
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
    } else {
      console.log('No owner found in DB. Creating default admin...');
      admin = await User.create({
        name: 'Admin Owner',
        email: 'admin@s3elite.com',
        password: 'adminpassword123',
        role: 'owner',
        phone: '9494211015'
      });
      console.log('Admin user created successfully!');
      console.log('Email: admin@s3elite.com');
      console.log('Password: adminpassword123');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkOrCreateAdmin();
