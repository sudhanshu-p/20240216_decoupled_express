/**
 * Problem statement - Create a class that accesses the mongo-based database
 * and creates methods for the required API endpoints.
 */
const Product = require("./models/Product.js")
const Order = require("./models/Order.js")
const Database = require("./db.js")

class ecommerceDatabase {
    /** Create a new entry in the product collection.
     * @param {object} params The product to be inserted's metadata
     * @returns {object} {status, message}
     */
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

        return { status: 201, message: newProduct }
    }

    /** Get a product by it's ID
     * @param {object} params The product to be fetched's ID
     * @returns {object} {status, message}
     */
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

    /** Search the database for a string
     * @param {object} params An object containt search_string key
     * @returns {object} {status, message}
     */
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

    /** Update an Product
     * @param {object} params The new data of the product
     * @returns {object} {status, message}
     */
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

    /** Delete an entry from the product collection.
     * @param {object} params The product to be deleted's ID
     * @returns {object} {status, message}
     */
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

    /** Creates a new Order and updates inventory stock.
     * @param {object} params An object containing keys id and quantity
     * @returns {object} {status, message}
     */
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
        return {
            status: 201,
            message: newOrder
        }
    }

    /** Get an Order by its ID
     * @param {object} params Object containing ID of order
     * @returns {object} {status, message}
     */
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

    /** Delete an order by it's ID. (and update stock to reflect same)
     * @param {object} params The order to be deleted's ID
     * @returns {object} {status, message}
     */
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
