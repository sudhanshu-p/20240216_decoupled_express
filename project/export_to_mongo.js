const mongoose = require("mongoose")
const Database = require("./json_implementation/src")
const Product = require("./mongo_implementation/models/Product")
const Order = require("./mongo_implementation/models/Order")

async function exportToMongo() {
    await mongoose.connect("mongodb+srv://root:root@mycluster.qa9j41l.mongodb.net/")
        .then(() => console.log("Connected to MongoDB Database!"))

    const db = new Database("./database")
    db.connect("express-commerce")


    await Product.deleteMany({})
        .then(() => console.log("All products deleted"))
    const localProductData = db.readCollection("product-collection")
    // console.log(localProductData)
    for (let i = 0; i < localProductData.length; i++) {
        const product = new Product(localProductData[i])
        await product.save()
    }
    console.log("All products uploaded")


    await Order.deleteMany({})
        .then(() => console.log("All orders deleted"))

    const localOrderData = db.readCollection("order-collection")
    for (let i = 0; i < localOrderData.length; i++) {
        const order = new Order(localOrderData[i])
        await order.save()
    }
    console.log("All orders uploaded")
}

exportToMongo()

console.log("Local products force uploaded to Mongo")
