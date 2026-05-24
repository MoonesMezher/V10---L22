const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema({
    stars: {
        type: Number,
        default: 0
    }, 
    comment: String,
    resturantId: {
        type: mongoose.Types.ObjectId,
        ref: "Resturant"
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "Order"
    } 
}, { timestamps: true })

module.exports = mongoose.model("Rate", rateSchema)