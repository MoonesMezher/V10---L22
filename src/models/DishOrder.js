const mongoose = require("mongoose");

const dishOrderSchema = new mongoose.Schema({
    dishId: {
        type: mongoose.Types.ObjectId,
        ref: "Dish"
    },
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "Order"
    },
    price: {
        type: Number,
        required: true
    }, 
    count: {
        type: Number,
        default: 1
    }, 
    total: {
        type: Number,
        required: true
    }, 
    notes: String
}, { timestamps: true })

module.exports = mongoose.model("DishOrder", dishOrderSchema);
// M:M
// get all dishes related with order:
// await DishOrder.find({ orderId: id }).populate("dishId")

// get all orders realted with dish:
// await DishOrder.find({ dishId: id }).populate("orderId")