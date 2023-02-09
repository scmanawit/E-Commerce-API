const express = require("express");
const router = express.Router();
const auth = require("../auth.js");

const productController = require("../Controllers/productController.js");

// Create new product
router.post("/", auth.verify, productController.addProduct);

// Get all product
router.get("/", productController.getAllProducts)

// Get Specific Product
router.get("/:productId", productController.getProduct)

// Update product information
router.put("/:productId",auth.verify, productController.updateProduct)

// Archive product
router.delete("/:productId", auth.verify, productController.archiveProduct)








module.exports = router;