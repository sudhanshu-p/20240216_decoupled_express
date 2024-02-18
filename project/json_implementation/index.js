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
        try {

        }
        catch (err) {
            console.log(err)
        }
        // return { status, message }
    }

    getProduct(params) {

        return { status, message }
    }

    searchProduct(params) {

        return { status, message }
    }

    putProduct(params) {

        return { status, message }
    }

    deleteProduct(params) {

        return { status, message }
    }

    checkout(params) {

        return { status, message }
    }

    getOrder(params) {

        return { status, message }
    }

    putOrder(params) {

        return { status, message }
    }

    deleteOrder(params) {

        return { status, message }
    }
}

module.exports = ecommerceDatabase
