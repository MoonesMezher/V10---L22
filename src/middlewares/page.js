const page = (req, res, next) => {
    const page = +req.query.page || 1;

    req._page = page;

    next();
}

module.exports = page