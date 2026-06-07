const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authController = require("../controllers/auth.controller");
const auth = require("../middlewares/auth");
const optionalAuth = require("../middlewares/optionalAuth");
const role = require("../middlewares/role");
const { loginLimiter } = require("../middlewares/limiter");
const { registerValidation, loginValidation } = require("../validation/auth.validate");

router.get("/profile", [optionalAuth], asyncHandler(authController.profile))

// name, phone, email, password
router.post("/register", [...registerValidation], asyncHandler(authController.register))

router.post("/login", [...loginValidation], asyncHandler(authController.login))

router.post("/logout", [auth], asyncHandler(authController.logout))

router.put("/refresh-token", asyncHandler(authController.refreshToken))

router.get("/test", [auth, role(["customer"])], (req, res) => {
    res.status(200).json("DONE");
})

module.exports = router