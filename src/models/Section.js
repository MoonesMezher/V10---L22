const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    descrption: String,
    resturantId: {
        type: mongoose.Types.ObjectId,
        ref: "Resturant"
    } 
}, { timestamps: true })

module.exports = mongoose.model("Section", sectionSchema)
// 1:M
// get all sections with resturant details:
// await Section.find().populate("resturantId")
// [{ title, desc, resruratnId }]