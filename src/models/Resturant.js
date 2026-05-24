const mongoose = require("mongoose");

const resturantSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    descrption: String,
    photo: {
        type: String,
        default: "img.png"
    },  
    location: {
        type: String,
        required: true
    }, 
    address: {
        type: String,
        required: true
    }, 
    hoursWork: {
        type: Number,
        default: 10
    }, 
    avgRate: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = mongoose.model("Resturant", resturantSchema)
// 1:M
// get resturant by id with all its sections:
// await Section.find({ resturantId: id })