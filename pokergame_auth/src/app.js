// src/app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/auth.routes.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// CORS: permite varios orígenes separados por coma o todo en dev
const allowed = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowed.length ? allowed : "*",
    credentials: true,
}));

app.use(express.json());

// Conectar DB (singleton)
await connectDB();

// Rutas
app.use("/auth", router);

// Health (para probar rápido en Vercel)
app.get("/auth/health", (_req, res) => res.json({ ok: true }));

export default app;
