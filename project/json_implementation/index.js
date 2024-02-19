/**
 * Problem statement - Create a class that accesses the JSON-based database
 * and creates methods for the required API endpoints.
 */

const Database = require("./src")

class ecommerceDatabase {

    /** The database accessor
     * @private
     */
    db

    constructor() {
        // Since the mongo based constructor won't need any params,
        // This one also won't need any params.

        // Creating the database
        this.db = new Database('./database')

        try {
            this.db.connect('express-commerce')
        }
        catch (err) {
            // Error can only mean database is somehow delted
            // Here, we will recreate the database
            __setupDatabase('express-commerce')
        }
    }

    /** Create a new entry in the product collection.
     * @param {object} params The product to be inserted's metadata
     * @returns {object} {status, message}
     */
    postProduct(params) {
        // For generating Product ID
        const products = this.db.readCollection("product-collection")
        const last_id = products[products.length - 1].id

        params.id = last_id + 1
        const result = this.db.createRecord("product-collection", params)

        if (result === true) {
            return {
                status: 201,
                message: this.db.readRecord("product-collection", params.id)
            }
        }

        return { status: result.status, message: result.message }
    }

    /** Get a product by it's ID
     * @param {object} params The product to be fetched's ID
     * @returns {object} {status, message}
     */
    getProduct(params) {
        const result = this.db.readRecord("product-collection", +params.id)

        if (result.status) {
            return {
                status: result.status,
                message: result.message
            }
        }
        if (!result) {
            return {
                status: 404,
                message: "Product not found"
            }
        }

        return {
            status: 200,
            message: result
        }
    }

    /** Search the database for a string
     * @param {object} params An object containt search_string key
     * @returns {object} {status, message}
     */
    searchProduct(params) {
        const search_string = params.search_string

        const results = this.db.readCollection("product-collection")

        // console.log(JSON.parse(results))

        const similarResults = {}
        for (const product of results) {
            // More presence of search_string in product's meta => more relevant
            let count = 0

            if (product["title"].toLowerCase()
                .includes(search_string.toLowerCase())) {
                count += 1
            }
            if (product["description"].toLowerCase()
                .includes(search_string.toLowerCase())) {
                count += 1
            }
            if (product["brand"].toLowerCase()
                .includes(search_string.toLowerCase())) {
                count += 1
            }

            if (count) {
                similarResults[product["id"]] = count
            }
        }

        if (Object.keys(similarResults).length === 0) {
            return {
                status: 404,
                message: "No results"
            }
        }

        // Sorting the results based on their frequency
        const sortedResults = Object.keys(similarResults)
            .sort((a, b) => similarResults[b] - similarResults[a]);

        const sortedData = []
        for (const productId of sortedResults) {
            const searchedProduct = results
                .filter((product) => product["id"] == productId)
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
    putProduct(product_id, new_product) {
        const result = this.db.updateRecord("product-collection", +product_id, new_product)
        console.log(result)

        if (result.status) {
            return {
                status: result.status,
                message: result.message
            }
        }
        if (!result) {
            return {
                status: 404,
                message: "Product not found"
            }
        }

        return {
            status: 202,
            message: this.db.readRecord("product-collection", +product_id)
        }
    }

    /** Delete an entry from the product collection.
     * @param {object} params The product to be deleted's ID
     * @returns {object} {status, message}
     */
    deleteProduct(params) {
        const product_id = +params.id

        const result = this.db.deleteRecord("product-collection", product_id)
        return {
            status: result.status,
            message: result.message
        }
    }

    /** Creates a new Order and updates inventory stock.
     * @param {object} params An object containing keys id and quantity
     * @returns {object} {status, message}
     */
    checkout(params) {
        const product_id = +params.id
        const product_quantity = +params.quantity

        const product = this.db.readRecord("product-collection", product_id)
        if (!product) {
            return {
                status: 404,
                message: "Invalid Product ID"
            }
        }

        if (product_quantity > product.stock) {
            return {
                status: 452,
                message: "Product Quantity is too high."
            }
        }

        this.db.updateRecord("product-collection", product_id,
            { "stock": +product.stock - +product_quantity })

        // Create a new order.
        // To create a new order ID, we need the list of order
        const ordersList = this.db.readCollection("order-collection")

        const orderData = {
            "id": ordersList.length + 1,
            "status": "Placed",
            "product_id": product_id,
            "product_quantity": product_quantity
        }

        this.db.createRecord("order-collection", orderData)

        return {
            status: 201,
            message: "Checkout successfull"
        }
    }

    /** Get an Order by its ID
     * @param {object} params Object containing ID of order
     * @returns {object} {status, message}
     */
    getOrder(params) {
        const order_id = params.id
        const result = this.db.readRecord("order-collection", +order_id)
        
        if (result.message) {
            return {
                status: result.status,
                message: result.message
            }
        }

        if (!result) {
            return {
                status: 404,
                message: "Order not found"
            }
        }
        console.log(result)
        return { status: 200, message: result }
    }

    /** Delete an order by it's ID. (and update stock to reflect same)
     * @param {object} params The order to be deleted's ID
     * @returns {object} {status, message}
     */
    deleteOrder(params) {
        const order_id = params.id

        const order = this.db.readRecord("order-collection", +order_id)

        if (!order) {
            return {
                status: 404,
                message: "No Order with this ID was found!"
            }
        }

        if (order.status === "Cancelled") {
            return {
                status: 452,
                message: "Order already cancelled"
            }
        }

        const product_id = +order.product_id
        const product_quantity = +order.product_quantity

        this.db.updateRecord("order-collection", +order_id,
            { status: "Cancelled" }
        )

        const product = this.db.readRecord("product-collection", product_id)

        if (!product) {
            return {
                status: 251,
                message: "Product with that ID has been deleted."
            }
        }

        this.db.updateRecord("product-collection", product_id, {
            "stock": product.stock + product_quantity
        })

        return {
            status: 201,
            message: "Deletion successful"
        }
    }
}

module.exports = ecommerceDatabase
