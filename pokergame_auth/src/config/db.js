import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const URL= `mongodb+srv://wilmerjrsantiago_db_user:${process.env.MONGO_PASS}@gamelogic.pl9ssdp.mongodb.net/pokerdb?retryWrites=true&w=majority&appName=GameLogic`

const connectDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log("✅ MongoDB connected with Auth");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
