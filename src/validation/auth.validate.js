const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const User = require("../models/User");

const registerValidation = [
    body("name")
        .isString().withMessage("Name must be string")
        .isLength({ min: 3, max: 30 }).withMessage("Name must have valid length"),
    
    body("phone")
        .isString().withMessage("Phone must be string")
        .isMobilePhone().withMessage("Phone must be string"),

    body("email")
        .isString().withMessage("Email must be string")
        .isEmail().withMessage("Email not valid")
        .custom(async val => {
            const user = await User.findOne({ email: val });

            if(user) {
                throw new Error("This Email Already Exist")
            }

            return true;
        }),
    
    body("password")
        /* .if(body("password").exists()) */
            .isString().withMessage("Password must be string")
            .isStrongPassword({ 
                minLength: 8, 
                minNumbers: 1, 
                minUppercase: 1, 
                minSymbols: 1,
                minLowercase: 2
            }).withMessage("Password is weak"),
    
    validate
];

const loginValidation = [
    body("email")
        .isString().withMessage("Invalid Email")
        .isEmail().withMessage("Invalid Email"),
    
    body("password")
        .isString().withMessage("Invalid Password")
        .isStrongPassword({ 
            minLength: 8, 
            minNumbers: 1, 
            minUppercase: 1, 
            minSymbols: 1,
            minLowercase: 2
        }).withMessage("Invalid Password"),
    
    validate
]

module.exports = {
    registerValidation,
    loginValidation
}