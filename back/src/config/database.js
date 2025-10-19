import mongoose from 'mongoose';

export const connectDB = async () => {
  // Relax strict populate to avoid errors when optional refs are missing
  mongoose.set('strictPopulate', false);

  const uri = process.env.DATA_BASE_UTL;
  if (!uri) {
    throw new Error('DATA_BASE_UTL is not defined in environment variables');
  }
  try {
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'serre',
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};