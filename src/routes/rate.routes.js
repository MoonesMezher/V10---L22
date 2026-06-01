const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const id = require("../middlewares/id");
const rateController = require("../controllers/rate.controller");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.get("/", asyncHandler(rateController.getAll));
router.get("/:id", [id], asyncHandler(rateController.getOne));
router.post("/", [auth, role(["customer"])], asyncHandler(rateController.add));
router.delete("/:id", [auth, id], asyncHandler(rateController.remove));

module.exports = router;
