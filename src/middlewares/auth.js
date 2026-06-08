const cookiesService = require("../utils/cookiesService");
const jwtService = require("../utils/jwtService");

const auth = (req, res, next) => {
    try {
        const token = cookiesService.getAccessToken(req)

        if(!token) {
            return res.status(403).json({
                message: "Not Authoraized"
            })
        }

        const decoded = jwtService.verifyAccessToken(token); 

        req._user = { ...decoded }

        // random text (not jwt) OR expired token OR token not from me
        // (not the same secrect key) => Catch
    
        next();
    } catch (error) {
        /* await refreshTokenService(); */
        return res.status(403).json({
            message: "Not Authoraized",
            error: error.message
        })
    }
}

module.exports = auth;