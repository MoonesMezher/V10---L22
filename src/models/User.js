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
        enum: ["customer", "driver", "resturant-owner", "admin"],
        default: "customer"
    },
    // block mechanism to sometime if he get failed 5 times
    blocked: { 
        type: Boolean,
        default: false
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockedUntil: Date
    /* profileId */
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema);

// 1:1
// get profile data to this user:
// await User.findById(id).populate("profileId")

// userId -> Profile
// await Profile.findOne({ userId: id });