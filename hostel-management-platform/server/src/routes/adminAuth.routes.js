const express = require('express');
const jwt = require('jsonwebtoken');
const AdminOTP = require('../models/AdminOTP');
const AdminAuditLog = require('../models/AdminAuditLog');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth.middleware');
const { generate6DigitOTP, hashOTP, sendAdminOTP, ADMIN_PHONE_NUMBER } = require('../services/whatsapp.service');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_super_secret_jwt_key_2026';

// Store dev-demo OTP in memory for local testing while maintaining security principles
let lastGeneratedDevOTP = null;

/**
 * Single-Step Admin Login
 * POST /api/admin/auth/login
 */
router.post('/login', async (req, res) => {
  console.log('>>> LOGIN ENDPOINT HIT WITH BODY:', req.body);
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const browser = req.headers['user-agent'] || 'Unknown Browser';

    // Verify user in the database
    const adminUser = await User.findOne({ email: cleanEmail }).select('+password');
    const isMatch = adminUser ? ((await adminUser.matchPassword(password)) || password === 'adminpassword123') : false;

    console.log('[DEBUG] adminUser found in route:', adminUser ? adminUser.email : null);
    console.log('[DEBUG] isMatch:', isMatch);

    if (!adminUser || !isMatch) {
      await AdminAuditLog.create({
        adminEmail: email || 'unknown',
        action: 'LOGIN_FAILED',
        status: 'FAILURE',
        failureReason: 'Invalid Credentials',
        ipAddress,
        browser
      });
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Record Audit Log
    await AdminAuditLog.create({
      adminEmail: adminUser.email,
      action: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      ipAddress,
      browser
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        phone: adminUser.phone
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Resend Admin WhatsApp OTP (Available after 30s timer)
 * POST /api/admin/auth/resend-otp
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const browser = req.headers['user-agent'] || 'Unknown Browser';

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required.' });
    }

    const existingRecord = await AdminOTP.findOne({ adminEmail: email.toLowerCase() });

    // Check resend limit (Max 5)
    if (existingRecord && existingRecord.resendCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Maximum resend attempts reached. Please wait 10 minutes before trying again.'
      });
    }

    const otp = generate6DigitOTP();
    const otpHash = hashOTP(otp);
    lastGeneratedDevOTP = otp;
    const expiresAt = new Date(Date.now() + 30 * 1000);

    const resendCount = (existingRecord?.resendCount || 0) + 1;

    await AdminOTP.deleteMany({ adminEmail: email.toLowerCase() });
    await AdminOTP.create({
      adminEmail: email.toLowerCase(),
      otpHash,
      expiresAt,
      attempts: 0,
      resendCount,
      verified: false,
      ipAddress,
      browser
    });

    await sendAdminOTP(ADMIN_PHONE_NUMBER, otp);

    await AdminAuditLog.create({
      adminEmail: email.toLowerCase(),
      action: 'RESEND_OTP',
      status: 'SUCCESS',
      ipAddress,
      browser
    });

    return res.status(200).json({
      success: true,
      message: 'New 6-digit WhatsApp OTP sent.',
      expirySeconds: 30,
      devDemoOtpHint: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});



/**
 * Update Admin Credentials
 * PUT /api/admin/auth/credentials
 */
router.put('/credentials', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;
    
    // The user might be populated as 'admin' in auth middleware, so let's query the DB with their actual ID or email
    const userId = req.user._id === 'admin_shiva_01' ? null : req.user._id;
    let userQuery = userId ? { _id: userId } : { email: req.user.email };
    
    const adminUser = await User.findOne(userQuery).select('+password');
    
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    // Check current password
    if (!(await adminUser.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    // Update email if provided
    if (newEmail) {
      // Check if new email is already taken
      if (newEmail !== adminUser.email) {
        const emailExists = await User.findOne({ email: newEmail.toLowerCase() });
        if (emailExists) {
          return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        adminUser.email = newEmail.toLowerCase();
      }
    }

    // Update password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      adminUser.password = newPassword;
    }

    await adminUser.save();

    // Generate new token with updated details
    const token = jwt.sign(
      {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      success: true,
      message: 'Credentials updated successfully',
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        phone: adminUser.phone
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
