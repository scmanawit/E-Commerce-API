const Product = require("../Models/productsSchema.js");
const auth = require("../auth.js");

// Add Product -Admin
module.exports.addProduct = (request, response) => {
    // todo: check headers auth if user is admin
    // todo: decode authorizatioin token
    const userData = auth.decode(request.headers.authorization);

    if (userData.isAdmin) {
        let input = request.body;

        let newProduct = new Product({
            name: input.name,
            description: input.description,
            price: input.price
        });

        // saves the created object to our database
        return newProduct.save().then(product => {
            // console.log(product);
            response.send(product);
        })
            .catch(error => {
                // console.log(error)
                response.send(false)
            })
    } else {
        response.send(401, "Unauthorized!")
    }

}

// Get all product
module.exports.getAllProducts = (request, response) => {

    Product.find({ deletedAt: null })
        .then(result => {
            return response.send(result)
        })
        .catch(error => {
            return response.send(error);
        })

}

// get specific product
module.exports.getProduct = (request, response) => {
    const productId = request.params.productId
    Product.findOne({ _id: productId })
        .then(result => {
            if (result === null) {
                return response.send("Invalid id!")
            } else {
                return response.send(result)
            }
        })
        .catch(error => {
            return response.send(error);
        })

}

// Update product information
module.exports.updateProduct = (request, response) => {
    const userData = auth.decode(request.headers.authorization);
    const productId = request.params.productId
    const input = request.body

    if (!userData.isAdmin) {
        return response.send("Unauthorized!")
    } else {
        let updatedProduct = {
            name: input.name,
            description: input.description,
            price: input.price
        }
        Product.findByIdAndUpdate(productId, updatedProduct, { new: true, fields: { deletedAt: false } })
            .then(result => {
                if (!result) {
                    return response.send('Invalid Id!')
                }

                response.send(result)
            })

    }
}

// Controller to archive product
module.exports.archiveProduct = async (request, response) => {
    try {
        const userData = auth.decode(request.headers.authorization);
        const productId = request.params.productId

        if (!userData.isAdmin) {
            return response.send("Unauthorized!")
        }

        let deletedProduct = {
            deletedAt: new Date(),
            isActive: false
        }
        const newProduct = await Product.findByIdAndUpdate(productId, deletedProduct, { new: true }).exec()

        if (!newProduct) {
            return response.send('Invalid Id!')
        }

        return response.send(newProduct)
    } catch (error) {
        return response.send(500, "There was an error! Please try again!")
    }



}




