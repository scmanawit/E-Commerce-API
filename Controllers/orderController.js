const mongoose = require("mongoose");
const Order = require("../Models/ordersSchema.js");
const auth = require("../auth.js");
const Product = require("../Models/productsSchema.js");



// get all orders
module.exports.getAllOrders = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);
        if (!userData.isAdmin) {
            throw new Error('Unathorized!')
        }

        const filters = {}

        const status = request.body.status
        if (status) {
            filters.status = status
        }

        const orders = await Order.find(filters).exec()
        return response.send(orders)
    } catch (error) {
        return response.status(400).send(error.message)
    }
}

// get specific order
module.exports.getOrder = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);
        if (!userData.isAdmin) {
            return response.send('Unauthorized!')
        }

        const orderId = request.params.orderId

        const order = await Order.findOne({ _id: orderId }).exec()
        if (!order) {
            return response.send("Invalid id!")
        }

        return response.send(order)
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }

}

// Controller for createCart
module.exports.createOrder = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);

        if (userData.isAdmin) {
            response.send('Admins are not allowed to Order!')
        }

        let cart = await Order.findOne({ userId: userData._id, status: "pending" }).exec()
        // console.log('EC', existingCart);
        if (!cart) {
            let newOrder = new Order({
                userId: userData._id,
            });

            cart = await newOrder.save()
        }

        return response.send(cart)
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }

}

// Controller for Adding products to order 
module.exports.addToCart = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);
        const productId = request.params.productId


        if (userData.isAdmin) {
            return response.send("Admin is not allowed to order!")
        }

        const order = await Order.findOne({
            userId: userData._id,
            status: 'pending'
        }).exec()

        if (!order) {
            return response.send('Invalid cart!')
        }

        const product = await Product.findById(productId).exec()
        if (!product) {
            return response.send("Invalid Product!")
        }

        let input = request.body
        const orderProduct = order.products.find((p) => (p.productId === productId))
        if (orderProduct) {
            const additionalTotal = input.quantity * product.price
            orderProduct.quantity = orderProduct.quantity + input.quantity
            orderProduct.subTotal = orderProduct.subTotal + additionalTotal
            order.total = order.total + additionalTotal
            const orderSave = await order.save()
            return response.send(orderSave)
        }

        const subTotal = input.quantity * product.price
        order.total = order.total + subTotal
        order.products.push({ productId: product._id, quantity: input.quantity, subTotal: subTotal })
        const orderSave = await order.save()
        return response.send(orderSave)
    }

    catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }
};

// Controller to clear cart
module.exports.clearCart = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);

        if (userData.isAdmin) {
            return response.send("Admin is not allowed to order!")
        }

        const order = await Order.findOne({
            userId: userData._id,
            status: 'pending'
        }).exec()

        if (!order) {
            return response.send('Cart not Found!')
        }

        order.products = []
        order.total = 0

        await order.save()
        return response.send(order)
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }



}

// Controller to remove a product from cart
module.exports.deleteProductFromCart = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);
        const productToRemove = request.params.productId

        if (userData.isAdmin) {
            return response.send("Admin is not allowed to order!")
        }

        const order = await Order.findOne({
            userId: userData._id,
            status: 'pending'
        }).exec()

        if (!order) {
            return response.send('Cart not found!')
        }

        const product = await Product.findById(productToRemove).exec()
        if (!product) {
            return response.send('Invalid product!')
        }

        let productIndex = null
        const orderProduct = order.products.find((p, index) => {
            if (p.productId === productToRemove) {
                productIndex = index
                return true
            }

            return false
        })

        order.total = order.total - orderProduct.subTotal
        order.products.splice(productIndex, 1)

        const orderSave = await order.save()

        return response.send(orderSave)
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }

}

// Controller to change product quantities
module.exports.changeProductQuantity = async (request, response) => {
    try {

        const userData = auth.decode(request.headers.authorization);
        const productToUpdate = request.params.productId;
        const input = request.body

        if (userData.isAdmin) {
            return response.send("Admin is not allowed to order!")
        }

        const order = await Order.findOne({
            userId: userData._id,
            status: 'pending'
        }).exec()

        if (!order) {
            return response.send('Cart not found!')
        }

        const product = await Product.findById(productToUpdate).exec()
        if (!product) {
            return response.send('Invalid product!')
        }

        let productIndex = null
        const orderProduct = order.products.find((p, index) => {
            if (p.productId === productToUpdate) {
                productIndex = index
                return true
            }

            return false
        })
        if (!orderProduct) {
            return response.send('Product does not exist! add the Product to cart')
        }
        order.total = order.total - orderProduct.subTotal

        if (input.quantity <= 0) {
            order.products.splice(productIndex, 1)
            return response.send(await order.save())
        }

        orderProduct.quantity = input.quantity
        orderProduct.subTotal = orderProduct.quantity * product.price
        order.total = order.total + orderProduct.subTotal

        const orderSave = await order.save()

        return response.send(orderSave)
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }
}

// controller for order checkout
module.exports.orderCheckout = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);

        if (userData.isAdmin) {
            return response.send("Admin is not allowed to order!")
        }

        const order = await Order.findOne({
            userId: userData._id,
            status: 'pending'
        }).exec()

        if (!order) {
            return response.send('Cart not found!')
        }

        if (order.products === undefined || order.products.length === 0) {
            return response.send('Your cart is empty!')
        }

        order.status = 'completed';
        order.transactionDate = new Date();
        const orderSave = await order.save()


        // Create new cart after checking out
        let newOrder = new Order({
            userId: userData._id,
        });

        await newOrder.save()

        return response.send(orderSave)
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }

}