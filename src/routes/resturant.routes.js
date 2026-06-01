const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const id = require("../middlewares/id");
const resturantController = require("../controllers/resturant.controller");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.get("/", asyncHandler(resturantController.getAll));
router.get("/:id", [id], asyncHandler(resturantController.getOne));
router.post("/", [auth, role(["resturant-owner"])], asyncHandler(resturantController.add));
router.put("/:id", [auth, role(["resturant-owner"]), id], asyncHandler(resturantController.update));
router.delete("/:id", [auth, role(["resturant-owner"]), id], asyncHandler(resturantController.remove));

module.exports = router;
