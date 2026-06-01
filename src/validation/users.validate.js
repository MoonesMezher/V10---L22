const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const deleteUserValidation = [
    param("id")
        .isMongoId().withMessage("Invalid ID"),

    validate
]

module.exports = {
    deleteUserValidation
}