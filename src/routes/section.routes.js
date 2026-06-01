const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const id = require("../middlewares/id");
const sectionController = require("../controllers/section.controller");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.get("/", asyncHandler(sectionController.getAll));
router.get("/:id", [id], asyncHandler(sectionController.getOne));
router.post("/", [auth, role(["resturant-owner"])], asyncHandler(sectionController.add));
router.put("/:id", [auth, role(["resturant-owner"]), id], asyncHandler(sectionController.update));
router.delete("/:id", [auth, role(["resturant-owner"]), id], asyncHandler(sectionController.remove));

module.exports = router;
