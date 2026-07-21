require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmails = ['admin@s3elite.com', 'shiva@s3elite.in', 'shiva@smartpg.com'];

    for (const email of adminEmails) {
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name: 'Shiva (PG Owner)',
          email: email,
          password: 'adminpassword123',
          role: 'owner',
          phone: '9494211015'
        });
        await user.save();
        console.log(`Created admin account for: ${email}`);
      } else {
        user.password = 'adminpassword123';
        user.role = 'owner';
        await user.save();
        console.log(`Updated admin account password for: ${email}`);
      }
    }

    console.log('All admin credentials ready!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admins:', err);
    process.exit(1);
  }
};

seedAdmins();
