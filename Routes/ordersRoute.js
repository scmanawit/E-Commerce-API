const express = require("express");
const router = express.Router();
const auth = require("../auth.js");

const orderController = require("../Controllers/orderController.js");

// Route for get all orders
router.get("/", auth.verify, orderController.getAllOrders)

// Route for get specific order
router.get("/:orderId", orderController.getOrder)

// Create Order
router.post("/", auth.verify, orderController.createOrder)

// Add to cart
router.post("/addToCart/:productId", auth.verify, orderController.addToCart)

// Route to clear cart
router.put("/clearCart", auth.verify, orderController.clearCart)

// Route to remove a product from cart/order
router.put("/delete/:productId", auth.verify, orderController.deleteProductFromCart)

// Route to change product quantities
router.put("/changeQuantity/:productId", auth.verify, orderController.changeProductQuantity)

// Route for checkoutorder
router.put("/checkOut", auth.verify, orderController.orderCheckout)


module.exports = router;