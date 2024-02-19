/**
 * Problem statement - Create a class that accesses the mongo-based database
 * and creates methods for the required API endpoints.
 */
const Product = require("./models/Product.js")
const Order = require("./models/Order.js")
const Database = require("./db.js")

class ecommerceDatabase {
    async postProduct(params) {
        const lastProduct = await Product.find({})
            .sort({ _id: -1 })
            .limit(1)


        if (!lastProduct[0]) {
            params.id = 1
        }
        else {
            params.id = lastProduct[0].id + 1
        }

        const newProduct = new Product(params)
        await newProduct.save()

        return { status: 200, message: "Product saved successfully" }
    }

    async getProduct(params) {

        const product = await Product.findOne({ id: params.id })
        if (!product) {
            return {
                status: 404,
                message: "Product not found"
            }
        }

        return {
            status: 200,
            message: product
        }
    }

    async searchProduct(params) {
        const search_string = params.search_string

        const productList = await Product.find({
            description: { $regex: new RegExp(search_string, "i") }
        })

        if (productList.length === 0) {
            return {
                status: 404,
                message: "No similar products"
            }
        }

        return {
            status: 200,
            message: productList
        }
    }

    async putProduct(product_id, new_product) {
        const product = await Product.findOne({ id: product_id })
        if (!product) {
            return {
                status: 404,
                message: "Product not found"
            }
        }

        await Product.findOneAndUpdate({ id: product_id }, new_product)
        const updatedProduct = await Product.findOne({ id: product_id })
        return {
            status: 200,
            message: updatedProduct
        }
    }

    async deleteProduct(params) {
        const product = await Product.findOne({ id: params.id })
        if (!product) {
            return {
                status: 404,
                message: "Product not found"
            }
        }

        await Product.findOneAndDelete({ id: params.id })

        return {
            status: 202,
            message: "Deleted successfully"
        }
    }

    async checkout(params) {
        const product = await Product.findOne({ id: params.id })
        if (!product) {
            return {
                status: 404,
                message: "Product not found"
            }
        }

        if (params.quantity > product.stock) {
            return {
                status: 452,
                message: "Order quantity is too high"
            }
        }

        product.stock -= params.quantity
        await product.save()

        console.log("Product saved successfully.")

        // Create a new Order
        const lastOrder = await Order.find({})
            .sort({ _id: -1 })
            .limit(1)


        const newOrder = new Order({
            id: lastOrder[0].id + 1,
            status: "Placed",
            product_id: params.id,
            product_quantity: params.quantity
        })

        await newOrder.save()
        console.log("Order created successfully.")
        return {
            status: 201,
            message: newOrder
        }
    }

    async getOrder(params) {

        const order_details = await Order.findOne({ id: params.id })

        if (!order_details) {
            return {
                status: 404,
                message: "Order not found"
            }
        }

        return {
            status: 200,
            message: order_details
        }
    }

    async deleteOrder(params) {
        const order = await Order.findOne({ id: params.id })
        if (!order) {
            return {
                status: 404,
                message: "Order not found"
            }
        }

        await Product.findOneAndDelete({ id: params.id })

        return {
            status: 202,
            message: "Deleted successfully"
        }
    }
}

module.exports = ecommerceDatabase
