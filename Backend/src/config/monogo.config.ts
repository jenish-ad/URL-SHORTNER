import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Set MONGO_URI in Backend/.env before starting the server.");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    throw new Error(
      "MongoDB connection failed. Start MongoDB or check MONGO_URI in Backend/.env.",
      { cause: error },
    );
  }
};

export default connectDB;
