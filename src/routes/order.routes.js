const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const id = require("../middlewares/id");
const orderController = require("../controllers/order.controller");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.get("/", [auth], asyncHandler(orderController.getAll));
router.get("/:id", [auth, id], asyncHandler(orderController.getOne));
router.post("/", [auth, role(["customer"])], asyncHandler(orderController.add));
router.put("/:id", [auth, id], asyncHandler(orderController.update));
router.delete("/:id", [auth, id], asyncHandler(orderController.remove));

module.exports = router;
