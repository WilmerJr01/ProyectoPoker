import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index.routes.js";
import connectDB from "./config/db.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import {configureSocket} from "./controllers/socket.controller.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: `http://localhost:${process.env.PORT_FRONT || 5173}`,
        methods: ["GET", "POST"],
    },
});

const userIdToSocket = configureSocket(io);

// Conectar a la base de datos
connectDB();

// Rutas
app.use("/api", router);

// Puerto
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
