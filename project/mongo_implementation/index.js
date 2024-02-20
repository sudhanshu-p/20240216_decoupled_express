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

        // Check for search string in description
        const productListByDescription = await Product.find({
            description: { $regex: new RegExp(search_string, "i") }
        })

        // Check for search string in title
        const productListByTitle = await Product.find({
            title: { $regex: new RegExp(search_string, "i") }
        })

        // Check for search string in brand
        const productListByBrand = await Product.find({
            brand: { $regex: new RegExp(search_string, "i") }
        })

        // This list will represent their relevance.
        // If a product is present in all 3 metadatas, it is more relevant.
        const similarResults = {}
        for (const product of productListByTitle) {
            if (!similarResults[product.id]) {
                similarResults[product.id] = 1
                continue
            }
            similarResults[product.id] = similarResults[product.id] + 1
        }

        for (const product of productListByDescription) {
            if (!similarResults[product.id]) {
                similarResults[product.id] = 1
                continue
            }
            similarResults[product.id] = similarResults[product.id] + 1
        }

        for (const product of productListByBrand) {
            if (!similarResults[product.id]) {
                similarResults[product.id] = 1
                continue
            }
            similarResults[product.id] = similarResults[product.id] + 1
        }

        // In the case no products are found.
        if (Object.keys(similarResults).length === 0) {
            return {
                status: 404,
                message: "No similar products"
            }
        }

        // Now, sorting the product based on their relevance.
        const sortedResults = Object.keys(similarResults)
            .sort((a, b) => similarResults[b] - similarResults[a]);


        // Sorting was done only via keys. Retriving the entire product now.
        const sortedData = []
        for (let index = 0; index < sortedResults.length; index++) {
            // We don't know which array has the result, so loop through all.
            let searchedProduct = productListByTitle
                .filter((product) => product.id === +sortedResults[index])

            if (searchedProduct.length === 0) {
                searchedProduct = productListByDescription
                    .filter((product) => product.id === +sortedResults[index])
            }

            if (searchedProduct.length === 0) {
                searchedProduct = productListByBrand
                    .filter((product) => product.id === +sortedResults[index])
            }

            sortedData.push(searchedProduct[0])
        }

        return {
            status: 200,
            message: sortedData
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
        // If the order is not found
        if (!order) {
            return {
                status: 404,
                message: "Order not found"
            }
        }

        // If the order is already cancelld
        if (order.status === "Cancelled") {
            return {
                status: 452,
                message: "Order is already cancelled"
            }
        }

        // Save the order
        order.status = "Cancelled"
        await order.save()

        // Updating the stocks of the product
        const product_id = order.product_id
        const product = await Product.findOne({ id: product_id })

        if (!product) {
            // This is not an error, the product might deleted after the order
            // creation. The frontend doesn't see it any different than normal
            return {
                status: 202,
                message: "Order cancelled successfully"
            }
        }

        product.stock = product.stock + order.product_quantity
        await product.save()

        return {
            status: 202,
            message: "Order cancelled successfully"
        }
    }
}

module.exports = ecommerceDatabase
