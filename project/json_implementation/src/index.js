const Database = require('./Database')

function testingFunction() {
    // Connecting to the Database of Databases
    const db = new Database('./data')

    // Creating 1 folder
    // db.createDatabase('testing-database')
    console.log("Database created!")

    // Creating 100 folders
    // for (let i = 0; i < 100; i++) {
    //     db.createDatabase('database' + i)
    //     console.log('Database created successfully')
    // }

    // db.connect('testing-database')

    // Read all existing files in the database
    // const existingDatabases = db.readDatabase()
    // console.log('Existing Collections:', existingDatabases)

    // Rename a database
    // db.renameDatabase('new-database')
    // console.log('Database renamed!')

    // Delete a database
    // db.deleteDatabase()
    // console.log("Database deleted!")

    // db.forceDeleteDatabase()

    db.connect("new-database")

    // Creating a Collection
    // db.createCollection("testing-collection")

    // Reading a Collection
    // const content = db.readCollection("testing-collection")
    // console.log(`File content: ${content}`)

    // Updating a Collection
    // db.renameCollection( "testing-collection", "new-collection")

    // Deleting a Collection
    // db.deleteCollection("new-collection")
    // db.forceDeleteCollection("testing-database", "new-renamed-collection")

    // Setting schema
    const schema1 = {
        name: {
            type: 'string',
            primary: true
        },
        email: {
            type: 'string'
        }
    }

    // db.setSchema('testing-collection', schema1)

    const object1 = {
        name: 'Sudhanshu',
        email: 'abc@gmail.com'
    }

    const object2 = {
        name: 'Pandey',
        email: 'abd@gmail.com'
    }

    const object3 = {
        email: 'donot@gmail.com'
    }

    // Creating a record inside the collection
    // db.createRecord('testing-collection', object1)
    // db.createRecord('testing-collection', object3)
    // console.log("Created Records successfully.")

    // Reading a record inside the collection
    // console.log(db.readRecord("testing-collection", "Sudhanshu"))

    // Updating a record inside the collection
    // db.updateRecord("testing-collection", "Pandey", object3)

    // Reading a record inside the collection
    // console.log(db.readRecord("testing-collection", "Sudhanshu"))

    // console.log(db.readCollection("testing-collection"))

    // console.log(db.deleteRecord("testing-collection", "Pandey"))

    // console.log(db.readCollection("testing-collection"))
}

module.exports = Database
