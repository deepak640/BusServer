const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config({ path: "./.env" })
mongoose.connect(process.env.DB, { useNewUrlParser: true }, function () {
    console.log("Database connected")
})