const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    status: {
        type: String
    },
    product_id: {
        type: Number
    },
    product_quantity: {
        type: Number
    }
})

const Order = mongoose.model("order-collection", orderSchema)

module.exports = Order