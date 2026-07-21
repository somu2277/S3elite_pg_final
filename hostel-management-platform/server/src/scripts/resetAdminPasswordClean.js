require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Wipe any old owner accounts
    await User.deleteMany({ role: 'owner' });
    await User.deleteMany({ email: { $in: ['admin@s3elite.com', 'shiva@s3elite.in', 'shiva@smartpg.com'] } });
    console.log('Cleared old admin users.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword123', salt);

    // Create fresh owner accounts using insertMany to bypass pre-save hook double hashing
    const admins = [
      {
        name: 'Shiva (PG Owner)',
        email: 'admin@s3elite.com',
        password: hashedPassword,
        role: 'owner',
        phone: '9494211015'
      },
      {
        name: 'Shiva (PG Owner)',
        email: 'shiva@s3elite.in',
        password: hashedPassword,
        role: 'owner',
        phone: '9494211015'
      },
      {
        name: 'Shiva (PG Owner)',
        email: 'shiva@smartpg.com',
        password: hashedPassword,
        role: 'owner',
        phone: '9494211015'
      }
    ];

    await User.insertMany(admins);
    console.log('Successfully created fresh admin accounts!');

    // Test password comparison directly
    const testAdmin = await User.findOne({ email: 'admin@s3elite.com' }).select('+password');
    const isMatch = await bcrypt.compare('adminpassword123', testAdmin.password);
    console.log('Direct bcrypt.compare test:', isMatch);

    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin password:', err);
    process.exit(1);
  }
};

resetAdmin();
