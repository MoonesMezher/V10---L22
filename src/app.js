require("dotenv").config();
const express = require("express");
const app = express();
const { default: mongoose } = require("mongoose");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const cookies = require("cookie-parser");
const { limiter } = require("./middlewares/limiter");
const xssSanitize = require("./middlewares/xss");
const cors = require("cors");
const path = require("path");

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(limiter);
app.use(express.json()); // json data 
app.use(express.urlencoded({ extended: true })); // files
app.use(require("morgan")("dev"));
app.use(cookies());
app.use(xssSanitize);
app.use(express.static("public"));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")))
app.get("/favicon.ico", (_req, res) => res.status(204).end());
app.get("/api/health", (req, res) => res.status(200).json("API is Healthy"))
app.use("/api/v1/auth", require("./routes/auth.routes"))
app.use("/api/v1/uploads", require("./routes/uploads.routes"))
app.use("/api/v1/users", require("./routes/user.routes"))
app.use("/api/v1/resturants", require("./routes/resturant.routes"))
app.use("/api/v1/sections", require("./routes/section.routes"))
app.use("/api/v1/dishs", require("./routes/dish.routes"))
app.use("/api/v1/orders", require("./routes/order.routes"))
app.use("/api/v1/rates", require("./routes/rate.routes"))

app.use(errorHandler);
app.use(notFound);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("Connected to database successfully")
        app.listen(PORT, () => {
            console.log("Server is running successfully");
        })
    })
    .catch(err => {
        console.log("Mongodb Error:", err.message);
    })

// Open Code
// Kiro: kiro.dev