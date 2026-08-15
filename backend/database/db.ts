import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models.js';

dotenv.config();

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
  
  await mongoose.connect(uri);
  isConnected = true;
  console.log("Connected to MongoDB");

  // Seed default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'bhramar123@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'bhramar123';
  
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(adminPassword, salt);
    
    await User.create({
      email: adminEmail,
      password_hash,
      roles: ['admin'],
      requiresPasswordChange: true
    });
    console.log(`Seeded default admin user: ${adminEmail}`);
  }
}
