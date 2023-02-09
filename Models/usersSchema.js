const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, "email is required!"]
    },
    password:{
        type: String,
        required: [true, "password is required!"]
    },
    isAdmin:{
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Users", usersSchema)