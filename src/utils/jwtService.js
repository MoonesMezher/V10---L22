require("dotenv").config();
const jwt = require("jsonwebtoken");

class JwtService {
    sign(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })
    }

    verify(token) {
        return jwt.verify(token, process.env.JWT_SECRET_KEY)
    }
}

module.exports = new JwtService();