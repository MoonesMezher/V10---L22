const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authController = require("../controllers/auth.controller");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { loginLimiter } = require("../middlewares/limiter");

router.get("/profile", [auth], asyncHandler(authController.profile))

router.post("/register", asyncHandler(authController.register))

router.post("/login", [loginLimiter], asyncHandler(authController.login))

router.post("/logout", [auth], asyncHandler(authController.logout))

router.get("/test", [auth, role(["customer"])], (req, res) => {
    res.status(200).json("DONE");
})

module.exports = router