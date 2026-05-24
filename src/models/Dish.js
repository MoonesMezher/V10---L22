const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    descrption: String,
    photo: {
        type: String,
        default: "img.png"
    },  
    price: {
        type: String,
        default: 0
    }, 
    available: {
        type: Boolean,
        default: true
    },
    sectionId: {
        type: mongoose.Types.ObjectId,
        ref: "Section"
    }
}, { timestamps: true })

module.exports = mongoose.model("Dish", dishSchema)