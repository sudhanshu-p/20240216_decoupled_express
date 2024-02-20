// Internal dependencies
// const ecommerceDatabase = require("./json_implementation")
const ecommerceDatabase = require("./mongo_implementation")

const database = new ecommerceDatabase()

// Setting up external dependencies
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
app.use(bodyParser.json())
const PORT = 3000


// Helper functions to avoid repitition
function outputToResponse(output, res) {
    // 2xx status codes indicate success
    if (output.status % 100 === 2) {
        res.status(output.status).json(output.message)
        return
    }
    else {
        res.status(output.status).send(output.message)
    }
}


app.get("/", (req, res) => {
    res.status(200).json("Welcome to Express Commerce")
})

// Creating a Product
app.post('/product', async (req, res) => {
    // For create product, params contain all the product fields.
    const params = req.body
    if (!params) {
        res.status(451).send("Params not found.")
    }

    // Adding some check that are common to both databases here.
    if (params.stock < 0) {
        res.status(455).send("Invalid Quantity")
    }
    if (params.price < 0) {
        res.status(456).send("Price cannot be negative.")
    }

    const result = await database.postProduct(params)
    outputToResponse(result, res)
})

// Reading a Product
app.get('/product/:id', async (req, res) => {
    if (!req.params.id) {
        res.status(451).send("Params not found.")
    }

    const result = await database.getProduct(req.params)
    outputToResponse(result, res)
})

// Read all similar products
app.get('/search', async (req, res) => {
    if (!req.query.search_string) {
        res.status(451).send("Invalid parameters")
    }
    const result = await database.searchProduct(req.query)
    outputToResponse(result, res)

})

// Updating a Product
app.put('/product/:id', async (req, res) => {

    const product_id = req.params.id
    const new_product = req.body

    if (!product_id || !new_product) {
        res.status(451).message("Invalid parameters")
    }

    // Adding some check that are common to both databases here.
    if (new_product.stock && new_product.stock < 0) {
        res.status(455).send("Invalid Quantity")
    }

    if (new_product.price && new_product.price < 0) {
        res.status(456).send("Price cannot be negative.")
    }

    const result = await database.putProduct(product_id, new_product)
    outputToResponse(result, res)

})

// Deleting a Product
app.delete('/product/:id', async (req, res) => {
    if (!+req.params.id) {
        res.status(451).message("Invalid parameters")
    }

    const result = await database.deleteProduct(req.params)
    outputToResponse(result, res)

})

// Creating an Order and Updating a Product
app.post('/checkout', async (req, res) => {
    if (!req.body.id || !req.body.quantity) {
        res.status(451).send("Invalid Parameters")
    }

    const params = req.body
    // Adding some check that are common to both databases here.
    if (params.quantity < 0) {
        res.status(455).send("Invalid Quantity")
    }

    const result = await database.checkout(params)
    outputToResponse(result, res)
})

// Reading an Order (Status)
app.get('/order/:id', async (req, res) => {
    if (!+req.params.id) {
        res.status(451).send("Invalid Parameters")
    }

    const result = await database.getOrder(req.params)
    outputToResponse(result, res)
})

// Deleting an order
app.delete('/cancel', async (req, res) => {
    if (!req.body.id) {
        res.status(451).send("Invalid parameter")
    }

    const result = await database.deleteOrder(req.body)
    outputToResponse(result, res)
})

app.listen(PORT, () => console.log("Server live"))
