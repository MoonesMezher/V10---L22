const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, 
    phone: {
        type: String,
        unique: [true, "Phone must be unique"],
        required: true
    }, 
    email: {
        type: String,
        unique: true,
        required: true
    }, 
    password: {
        type: String,
        required: true
    },
    address: String,
    realtimelocation: String,
    available: Boolean,
    role: {
        type: "String",
        enum: ["customer", "driver", "resturant-owner"],
        default: "customer"
    },
    /* blocked: { // true
        type: Boolean,
        default: false
    },
    countTries: { // 1, 2, 3, ,4 , 5
        type: Number,
        default: 0
    } */
    /* profileId */
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema);

// 1:1
// get profile data to this user:
// await User.findById(id).populate("profileId")

// userId -> Profile
// await Profile.findOne({ userId: id });