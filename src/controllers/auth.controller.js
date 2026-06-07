const User = require("../models/User");
const cookiesService = require("../utils/cookiesService");
const jwtService = require("../utils/jwtService");
const passwordService = require("../utils/passwordService");

class AuthController {
    handleFailedLoginAttempts = async (user) => {
        user.failedLoginAttempts = +(user.failedLoginAttempts || 0) + 1;

        if(user.failedLoginAttempts >= 5) {
            user.blocked = true;
            user.lockedUntil = new Date(Date.now() + (30 * 60 * 1000)) // 30M
        }

        await user.save();
    }

    resetFailedLoginAttempts = async (user) => {
        user.blocked = false;
        user.lockedUntil = null;
        user.failedLoginAttempts = 0;
        await user.save();
    }

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

        if(!user) {
            return res.status(400).json("Invalid Data")
        } 

        if(user.blocked) {
            if(user.lockedUntil <= Date.now()) {
                await this.resetFailedLoginAttempts(user);
            } else {
                return res.status(400).json("You can not login now")
            }
        } 

        const isVerified = await passwordService.compare(password, user.password)
        if(!isVerified) {
            await this.handleFailedLoginAttempts(user);
            return res.status(400).json("Invalid Data");
        }

        await this.resetFailedLoginAttempts(user);

        const token = jwtService.generateAccessToken({ 
            _id: user._id, 
            email: user.email, 
            role: user.role
        });

        const refreshToken = jwtService.generateRefreshToken({ 
            _id: user._id, 
            email: user.email, 
            role: user.role
        });

        user = user.toObject();
        delete user.password;

        cookiesService.setAccessToken(res, token)
        cookiesService.setRefreshToken(res, refreshToken)

        res.status(201).json({ user })
    }
    logout = async (req, res) => {
        cookiesService.clearTokens(res);
        res.status(201).json("Logged out Successfully");
    }
    profile = async (req, res) => {
        if (!req._user) {
            return res.status(200).json({ data: null });
        }

        const user = await User.findById(req._user._id).select("-password");

        res.status(200).json({ data: user });
    }
    refreshToken = async (req, res) => {
        const refreshToken = cookiesService.getRefreshToken(req);

        if(!refreshToken) {
            return res.status(401).json({ message: "Refresh Token Required" });
        }

        const decoded = jwtService.verifyRefreshToken(refreshToken);

        const data = { 
            _id: decoded._id, 
            email: decoded.email, 
            role: decoded.role
        }

        const token = jwtService.generateAccessToken(data);
        const refToken = jwtService.generateRefreshToken(data);
        cookiesService.setAccessToken(res, token);
        cookiesService.setRefreshToken(res, refToken);

        res.status(200).json({ message: "Refreshed Token Successfully" })
    }
}

module.exports = new AuthController();

// Hahsing: one-way
// Encryption: jwt