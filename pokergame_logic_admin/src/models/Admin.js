import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        nickname: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },
        password: {
            type: String,
            required: true,
        },
        tables: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Table",
                default: null
            },
        ],
        rol: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
