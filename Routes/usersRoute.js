const express = require("express");
const router = express.Router();
const auth = require("../auth.js");

const usersController = require("../Controllers/userController.js");

// User registration
router.post("/register", usersController.userRegistration);

// User authentication
router.post("/login", usersController.userAuthentication);

// retrieve user profile
router.get("/details", auth.verify, usersController.userProfile)

// Set user as admin
router.post('/:userId/setAsAdmin', auth.verify, usersController.userToAdmin)

// Retrieved authenticated User's orders
router.get('/orderHistory', auth.verify, usersController.myOrders)

// Route for myCart
router.get('/myCart', auth.verify, usersController.myCart)

module.exports = router;