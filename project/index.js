// Internal dependencies
const ecommerceDatabase = require("./json_implementation")
// const ecommerceDatabase = require("./mongo_implementation")

// Setting up external dependencies
const express = require("express")
const app = express()
const PORT = 3000

app.get("/", (req, res) => {
    res.status(200).json("Welcome to Express Commerce")
})

// Creating a Product
app.post('/product', (req, res) => {
    const { status, message } = database.putProduct(req)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Reading a Product
app.get('/product/:id', (req, res) => {
    const { status, message } = database.putProduct(req)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Read all similar products
app.get('/search', (req, res) => {
    const { status, message } = database.searchProduct(req)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Updating a Product
app.put('/product/:id', (req, res) => {
    const { status, message } = database.putProduct(req)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Deleting a Product
app.delete('/product/:id', (req, res) => {
    const { status, message } = database.deleteProduct(req)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Creating an Order and Updating a Product
app.post('/checkout', (req, res) => {
    const { status, message } = database.checkout(req)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Reading an Order (Status)
app.get('/order/:id', (req, res) => {
    const { status, message } = database.getOrder(req)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Updating an order (status)
app.put('/order', (req, res) => {
    const { status, message } = database.putOrder(req)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

// Deleting an order
app.delete('/order', (req, res) => {
    const { status, message } = database.deleteProduct(req)
    if (status % 100 === 2) {
        res.status(status).json(message)
    }
    else {
        res.status(status).send(message)
    }
})

app.listen(PORT, () => console.log("Server live"))
