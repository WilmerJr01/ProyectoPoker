import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Usamos una variable global para cachear la conexión
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

// URI completa, como tú la armas con la variable de contraseña
const URL = `mongodb+srv://wilmerjrsantiago_db_user:${process.env.MONGO_PASS}@gamelogic.pl9ssdp.mongodb.net/pokerdb?retryWrites=true&w=majority&appName=GameLogic`;

const connectDB = async () => {
  if (cached.conn) {
    // Si ya está conectada, reusamos
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(URL, {
        maxPoolSize: 10,
      })
      .then((mongoose) => {
        console.log("✅ MongoDB connected (Vercel singleton)");
        return mongoose.connection;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
