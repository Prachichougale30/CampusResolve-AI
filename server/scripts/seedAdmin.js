require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const requiredVariables = ['ADMIN_NAME', 'ADMIN_EMAIL'];

const seedAdmin = async () => {
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);
  if (missingVariables.length) {
    throw new Error(`Set these environment variables before seeding: ${missingVariables.join(', ')}`);
  }
  const generatedPassword = !process.env.ADMIN_PASSWORD;
  const password = generatedPassword ? crypto.randomBytes(32).toString('hex') : process.env.ADMIN_PASSWORD;
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusresolve_ai');

  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const configuredUserId = process.env.ADMIN_USER_ID?.trim();
  let userId = configuredUserId;
  let existingUser;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (!userId) {
      userId = `ADMIN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    }
    existingUser = await User.findOne({ $or: [{ email }, { userId }] });
    if (!existingUser || existingUser.email === email || configuredUserId) break;
    userId = undefined;
  }

  if (existingUser?.email === email) {
    throw new Error('The configured admin email already belongs to an account.');
  }
  if (existingUser) {
    throw new Error('Unable to generate a unique admin ID. Set ADMIN_USER_ID to an unused value.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name: process.env.ADMIN_NAME.trim(),
    email,
    password: hashedPassword,
    role: 'admin',
    userId,
    department: process.env.ADMIN_DEPARTMENT?.trim() || 'Administration',
    status: 'active',
  });
  console.log(`Administrator account provisioned for ${email}.`);
  console.log(`Admin ID: ${userId}`);
  if (generatedPassword) {
    console.log(`Generated password (save it now; it will not be shown again): ${password}`);
  }
};

seedAdmin()
  .catch((error) => {
    console.error('Administrator provisioning failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
