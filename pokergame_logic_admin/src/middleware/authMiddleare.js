import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // formato "Bearer <token>"

    try {
        if (!JWT_SECRET) {
            console.error("❌ JWT_SECRET no está definido");
            return res.status(500).json({ message: "Error interno de configuración" });
        }

        console.log("🔑 Usando secret:", JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET);

        console.log("✅ Token válido:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ Error al verificar token:", err.message);
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};

