import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET 

export function generateToken(user) {
    return jwt.sign(
        { id: user._id, nickname: user.nickname },
        JWT_SECRET,
        { expiresIn: "12h" }
    );
}

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
