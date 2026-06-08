const express = require("express");
const router = express.Router();

const uploadsController = require("../controllers/uploads.controller");
const asyncHandler = require("../utils/asyncHandler");
const uploadLocal = require("../middlewares/multer");
const multer = require("multer");

router.post("/local", 
    [uploadLocal.single("file")],
    asyncHandler(uploadsController.local))

router.post("/external", 
    [multer().single("file")],
    asyncHandler(uploadsController.external))

module.exports = router;