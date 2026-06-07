const cookiesService = require("./cookiesService");
const jwtService = require("./jwtService");

const refreshTokenService = (req, res) => {
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
}

module.exports = refreshTokenService;