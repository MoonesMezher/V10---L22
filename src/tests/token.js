const jwt = require("jsonwebtoken");

const secretKey = "111";

const token = jwt.sign({ name: "Moones", id: 1 }, secretKey, { expiresIn: "15m" })

const decoded = jwt.verify(token, secretKey);

console.log(
    decoded
);


