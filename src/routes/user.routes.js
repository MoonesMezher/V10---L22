const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler")
const id = require("../middlewares/id");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.get("/", asyncHandler(userController.getAll))

router.get("/:id", [id], asyncHandler(userController.getOne))

router.post("/", [auth, role(["resturant-owner", "customer"])], asyncHandler(userController.add))

router.put("/:id", [id], asyncHandler(userController.update))

router.delete("/:id", [id], asyncHandler(userController.remove))

module.exports = router