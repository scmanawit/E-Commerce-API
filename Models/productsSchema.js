const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Product name is required!"]
    },
    description:{
        type: String,
        required: [true, "Description of the course is required!"]
    },
    price:{
        type:Number,
        required: [true, "Price of the course is required!"]
    },
    isActive:{
        type: Boolean,
        default: true
    },
    createdAt:{
        type: Date,
        default: new Date()
    },
    deletedAt:{
        type: Date,
        default: null
    }

})

module.exports = mongoose.model("products", productsSchema)