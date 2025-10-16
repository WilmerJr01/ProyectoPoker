import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index.routes.js";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Conectar a la base de datos
connectDB();

// Rutas
app.use("/api", router);

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
