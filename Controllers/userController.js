const mongoose = require("mongoose");
const User = require("../Models/usersSchema.js");
const bcrypt = require("bcrypt");
const auth = require("../auth.js");
const Order = require("../Models/ordersSchema.js");



//  controller for user registration
module.exports.userRegistration = async (request, response) => {
    try {
        const input = request.body;

        const user = await User.findOne({ email: input.email }).exec()
        if (user) {
            return response.send("The email is already taken!")
        }

        let newUser = new User({
            email: input.email,
            password: bcrypt.hashSync(input.password, 10),
        })

        await newUser.save()
        return response.send("You are now registered to our website!");
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }

}

// user Authentication
module.exports.userAuthentication = async (request, response) => {
    try {
        let input = request.body;

        // Possible scenarios when logging in
        // 1. email is not yet registered
        // 2. email is registered but the password is wrong

        const user = await User.findOne({ email: input.email }).exec()

        if (user === null) {
            return response.send("Email is not yet registered. Register first before logging in!")
        }
        // verify if pw is correct
        // the "compaseSync" method is used to compare a non encrypted password to the encrypted password
        // retrurn boolean value, if match true will return otherwise false
        const isPasswordCorrect = bcrypt.compareSync(input.password, user.password)

        if (!isPasswordCorrect) {
            return response.send('Password Incorrect!')
        }

        const existingCart = await Order.findOne({ userId: user._id, status: "pending" }).exec()
        // console.log('EC',existingCart);
        if (!existingCart) {
            let newOrder = new Order({
                userId: user._id,
            });

            await newOrder.save()
        }


        return response.send({ auth: auth.createAccessToken(user) })
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }


}

// retrieve user profile
module.exports.userProfile = async (request, response) => {
    try {

        const userData = auth.decode(request.headers.authorization);

        let user = await User.findById(userData._id, { password: false }).exec()
        if (!userData.isAdmin) {
            user = user.toJSON()

            const userOrder = await Order.find({ userId: userData._id }).exec().catch(() => (null))
            // console.log('userOrder', userOrder);
            user.orders = userOrder
            // console.log('user', user);
        }
        return response.send(user)
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }


}

// controller for user to admin functionality
module.exports.userToAdmin = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);
        const userId = request.params.userId

        // check if login user is admin
        if (!userData.isAdmin) {
            return response.send("Unauthorized!")
        }

        // find user IsAdmin details
        const user = await User.findById(userId).exec()

        if (user.isAdmin) {
            return response.send(`user ${userId} is already an admin!`)
        }

        user.isAdmin = true
        user.save()
        return response.send(user)
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }

}

// Controller to retrieve authenticated user's orders history
module.exports.myOrders = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);

        // check if login user is admin
        if (userData.isAdmin) {
            return response.send("Unauthorized!")
        }
        // find user's orders
        const myOrders = await Order.find({ userId: userData._id, status: 'completed' }).exec()
        // console.log('myOders', myOrders);
        return response.send(myOrders);
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }

}

// Controller to retrieve my Cart
module.exports.myCart = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);

        // check if login user is admin
        if (userData.isAdmin) {
            return response.send("Unauthorized!")
        }
        // find user's orders
        const myCart = await Order.findOne({ userId: userData._id, status: 'pending' }).exec()
        // console.log('myOders', myOrders);
        return response.send(myCart);
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }

}