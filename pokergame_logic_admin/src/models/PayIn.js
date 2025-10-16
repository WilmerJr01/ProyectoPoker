import mongoose from "mongoose";

const payInSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        cardNumber: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
            trim: true,
            default: null
        },
    },
    { timestamps: true }
);

export default mongoose.model("PayIn", payInSchema);
