require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const users = await User.find({ role: 'owner' });
    console.log('Owners:', users);
    
    const shivaUser = await User.findOne({ email: 'shiva@smartpg.com' });
    console.log('shiva@smartpg.com:', shivaUser);

    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
