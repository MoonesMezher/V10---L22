const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ["pending", "accepted", "in-progress", "on-the-way", "completed", "canceled"],
        default: "pending"
    },
    total: {
        type: Number,
        required: true
    },
    customerId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }, 
    driverId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    resturantId: {
        type: mongoose.Types.ObjectId,
        ref: "Resturant",
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema)