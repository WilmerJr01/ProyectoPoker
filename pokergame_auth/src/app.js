import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/auth.routes.js";
import connectDB from "./config/db.js";

const app = express();
dotenv.config();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar a la base de datos
connectDB();

// Rutas
app.use("/auth", router);

// Puerto
const PORT = process.env.PORT_AUTH || 3001;
app.listen(PORT, () => {
    console.log(`✅ Servidor de Auth corriendo en http://localhost:${PORT}`);
});