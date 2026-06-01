const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const id = require("../middlewares/id");
const dishController = require("../controllers/dish.controller");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.get("/", asyncHandler(dishController.getAll));
router.get("/:id", [id], asyncHandler(dishController.getOne));
router.post("/", [auth, role(["resturant-owner"])], asyncHandler(dishController.add));
router.put("/:id", [auth, role(["resturant-owner"]), id], asyncHandler(dishController.update));
router.delete("/:id", [auth, role(["resturant-owner"]), id], asyncHandler(dishController.remove));

module.exports = router;
