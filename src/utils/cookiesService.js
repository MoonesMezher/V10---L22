const cookieConfig = {
    httpOnly: true, // http
    secure: false, // https
    sameSite: "strict",
    maxAge: 15 * 60 * 1000 //  15m
}

class CookiesService {
    getData = (req, key) => {
        return req.cookies[key]
    }

    setData = (res, key, value) => {
        res.cookie(key, value, cookieConfig)
    }

    clearData = (res, key) => {
        res.clearCookie(key)
    }
}

module.exports = new CookiesService();