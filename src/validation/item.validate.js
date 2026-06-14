const { body } = require("express-validator");
const validate = require("../middlewares/validate");

const addItemValidate = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be strings"),

    body("image")
        .if(body("image").exists())
            .isString().withMessage("Image must be strings"),

    validate
]

module.exports = {
    addItemValidate
}