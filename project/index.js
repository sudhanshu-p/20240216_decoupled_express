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


app.get("/", (req, res) => {
    res.status(200).json("Welcome to Express Commerce")
})

// Creating a Product ✅
app.post('/product', async (req, res) => {
    // For create product, params contain all the product fields.
    const params = req.body
    if (!params) {
        res.status(451).send("Params not found.")
    }

    const { status, message } = await database.postProduct(params)

    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    // Rest indicate errors
    else {
        res.status(status).send(message)
    }
})

// Reading a Product ✅
app.get('/product/:id', async (req, res) => {
    if (!req.params.id) {
        res.status(451).send("Params not found.")
    }

    const { status, message } = await database.getProduct(req.params)

    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Read all similar products ✅
app.get('/search', async (req, res) => {
    if (!req.query.search_string) {
        res.status(451).send("Invalid parameters")
    }
    const { status, message } = await database.searchProduct(req.query)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Updating a Product ✅
app.put('/product/:id', async (req, res) => {

    const product_id = req.params.id
    const new_product = req.body

    if (!product_id || !new_product) {
        res.status(451).message("Invalid parameters")
    }

    const { status, message } = await database.putProduct(product_id, new_product)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Deleting a Product ✅
app.delete('/product/:id', async (req, res) => {
    if (!+req.params.id) {
        res.status(451).message("Invalid parameters")
    }

    const { status, message } = await database.deleteProduct(req.params)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Creating an Order and Updating a Product ✅
app.post('/checkout', async (req, res) => {
    if (!req.body.id || !req.body.quantity) {
        res.status(451).send("Invalid Parameters")
    }

    const { status, message } = await database.checkout(req.body)

    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Reading an Order (Status) ✅
app.get('/order/:id', async (req, res) => {
    if (!+req.params.id) {
        res.status(451).send("Invalid Parameters")
    }

    const { status, message } = await database.getOrder(req.params)

    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Deleting an order ✅
app.delete('/cancel', async (req, res) => {
    if (!req.body.id) {
        res.status(451).send("Invalid parameter")
    }

    const { status, message } = await database.deleteOrder(req.body)

    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

app.listen(PORT, () => console.log("Server live"))
