const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://root:root@mycluster.qa9j41l.mongodb.net/")
    .then(() => console.log("Connected to MongoDB Database!"))
