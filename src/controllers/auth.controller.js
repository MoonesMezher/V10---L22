const User = require("../models/User");
const jwtService = require("../utils/jwtService");
const passwordService = require("../utils/passwordService");

class AuthController {
    register = async (req, res) => {
        const { name, phone, email, password } = req.body;

        const hashed = await passwordService.hash(password)

        let user = await User.create({ name, phone, email, password: hashed });
        user = user.toObject();

        delete user.password;

        res.status(201).json({ user });
    }
    login = async (req, res) => {
        const { email, password } = req.body;

        let user = await User.findOne({ email });

        if(!user) return res.status(400).json("Invalid Data");

        const isVerified = await passwordService.compare(password, user.password)
        if(!isVerified) {
            return res.status(400).json("Invalid Data");
        }

        const token = jwtService.sign({ _id: user._id, email: user.email });

        user = user.toObject();
        delete user.password;

        res.status(201).json({ user, token })
    }
    logout = async (req, res) => {
        res.status(201).json("Logged out Successfully");
    }
}

module.exports = new AuthController();

// Hahsing: one-way
// Encryption: jwt