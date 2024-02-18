/* Problem Definition - Create a DBMS to perform CRUD operations on
- A folder (Database)
- A file (Collection)
- An entry within that file (Record)
Additional - Implement a Schema and Schema verification algorithm.
*/

/** The class to perform the crud operations
 */
class Database {
    /** Root path of the data
    * @private
    */
    dataPath

    /** The database that is currently being accessed.
     * @private
     */
    currentDatabase

    /** Having the fs internal, so as not to expose the file system
     * @private
     */
    fs

    constructor(dataPath) {
        this.fs = require('fs')
        if (!this.fs.existsSync(dataPath)) {
            return {
                status: 500,
                message: "Invalid root folder of database."
            }
        }
        this.dataPath = dataPath
    }

    // INTERNAL (PRIVATE) FUNCTIONS

    /** Internal function that validates a database's name.
     * @param {String} databaseName Name of the datbase
     */
    __verifyDatabaseName(databaseName) {
        // TODO: Add Regex here
        const regex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
        return databaseName.length > 5 && regex.test(databaseName)
    }

    /** Internal function that checks if a database by the given name exists. 
     * @param {String} databaseName
    */
    __databaseExists(databaseName) {
        return this.fs.existsSync(`${this.dataPath}/${databaseName}`)
    }

    /** Internal function that validates a collection's name. 
     * @param {String} collectionName
    */
    __verifyCollectionName(collectionName) {
        if (collectionName.includes('config')) {
            return {
                status: 501,
                message: "Cannot manually create config files."
            }
        }

        // Can only start with a alphabet, can only contain alphabests, number,
        // - and _ symbols.
        const regex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
        return collectionName.length > 5 && regex.test(collectionName)
    }

    /** Internal function that check if a collection by the current name exists
    * @param {String} collectionName - Name of the collection
    * @returns {Boolean} Does the collection exist in current DB?
    */
    __collectionExists(collectionName) {
        const path = `${this.currentDatabase}/${collectionName}.json`
        return this.fs.existsSync(path)
    }

    /** Internal function that valdiates the schema given
    * @param {Object} schema The user designed schema
    * @returns {Boolean|String} true if schema is valid, else the errors.
    */
    __validateSchema(schema) {
        // Variable to keep track of the primary key found or not
        let primaryKeyExists = false

        // These are the acceptable types for a prop in the schema
        const validTypes = ['string', 'number', 'boolean', 'object']

        // These are the must have declarations for every prop in any Schema
        const requiredProperties = ['type']

        // Check if schema is an object or not
        if (typeof schema !== 'object' || Array.isArray(schema)) {
            return 'Schema must be an object.'
        }

        // Check if at least one property is defined
        if (Object.keys(schema).length === 0) {
            return 'Schema must have at least one property.'
        }

        for (const [propertyName, property] of Object.entries(schema)) {
            if (typeof property !== 'object' || Array.isArray(property)) {
                return 'Each property must be an object.'
            }

            // For every property that is required, check if it is actually there
            for (const index in requiredProperties) {
                // If it does not exist in the current property's details
                if (!property[requiredProperties[index]]) {
                    return `Each property should have ${requiredProperties[index]}`
                }
            }

            // Checking for the type being in allowed list.
            if (!validTypes.includes(property.type)) {
                return `Invalid type for ${propertyName}`
            }

            // If this property is specified as the primary one,
            if (property.primary) {
                // If there is a primary key already specified
                if (primaryKeyExists) {
                    return `Cannot have more tha 1 primary key`
                }
                primaryKeyExists = true
            }

        }

        // If the primary key is still not found
        if (!primaryKeyExists) return `Schema should have 1 primary key`

        // The given schema has been validated.
        return true
    }

    /** Internal function that validates an object against given schema 
     * @param {Object} schemaToValidateAgainst - Validated Schema to check against
     * @param {Object} objectToBeValidated - The object that is to be validated
     */
    __validateObject(schemaToValidateAgainst, objectToBeValidated) {

        // Check if the object given is an object
        if (typeof objectToBeValidated !== "object"
            || Array.isArray(objectToBeValidated)) {
            return `Data must be an object`
        }

        // Check if at least one property is defined
        if (Object.keys(objectToBeValidated).length === 0) {
            return 'Object must have at least one property.'
        }

        // Get the primary key of the schema
        const primaryKey = Object.keys(schemaToValidateAgainst).filter((prop) =>
            schemaToValidateAgainst[prop].primary
        )

        // Check if Object has primary key
        if (!objectToBeValidated.hasOwnProperty(primaryKey)) {
            return `Object must have the ${primaryKey} field`
        }

        // Get all the properties that are required
        const requiredProperties = Object.keys(schemaToValidateAgainst)
            .filter((prop) => schemaToValidateAgainst[prop].required)

        // Check if object has all the required properties
        for (const property of requiredProperties) {
            if (!objectToBeValidated.hasOwnProperty(property)) {
                return `${property} is a must have property.`
            }
        }

        // Looping and checking over each data.
        for (const [propName, propValue] of Object.entries(objectToBeValidated)) {

            // Check if the property is defined in schema
            if (!schemaToValidateAgainst.hasOwnProperty(propName)) {
                return `Invalid property ${propName}`
            }

            // Get the description of this property from schema
            const property = schemaToValidateAgainst[propName]

            // Validate type
            if (typeof propValue !== property.type) {
                return `Type mismatch for ${propName}. Expected ${property.type}`
            }
        }

        return true
    }

    /** Internal function that takes in Schema, and returns it's primary key
     * @param {object} schema
     * @returns {String} Primary key
     */
    __getPrimaryKey(schema) {
        const primaryKey = Object.keys(schema).filter((prop) =>
            schema[prop].primary
        )
        return primaryKey
    }

    /** Internal function that returns the schema for a particular collection
     * @param {String} collectionName - Name of collection
     * @returns {object} The schema
     */
    __getSchema(collectionName) {
        let schema
        // Fetch and parse the schema.
        try {
            schema = JSON.parse(
                this.fs.readFileSync(
                    `${this.currentDatabase}/${collectionName}-config.json`,
                    {
                        encoding: 'utf8',
                        flag: 'r'
                    }
                )
            )
        }
        // Meaning the schema file doesn't exist
        catch {
            return {
                status: 500,
                message: "Schema not found."
            }
        }

        return schema
    }

    // DATABASE CRUD OPERATIONS
    /** Create a new folder (Database) of the given name
     * @param {String} databaseName - Name of database to be created
     * @throws {Error} When a database with the same name already exists
     */
    createDatabase(databaseName) {
        this.__verifyDatabaseName(databaseName)
        if (this.__databaseExists(databaseName)) {
            return {
                status: 503,
                message: "Database with same name already exists"
            }
        }

        const path = `${this.dataPath}/${databaseName}`
        this.fs.mkdirSync(path)
        console.log("Created Database " + databaseName)
        this.connect(databaseName)
    }

    /** Takes in a database name to access that database 
    * @param {String} databaseName
    * TODO: Add a password mechanism.
    */
    connect(databaseName) {
        if (!this.__databaseExists(databaseName)) {
            throw new Error("Invalid Database.")
        }

        this.currentDatabase = `${this.dataPath}/${databaseName}`
        console.log("Connected to database " + databaseName)
    }

    /** List(Read) all the files of the current database 
     * @returns {Array<String>} List of all collections in this database
    */
    readDatabase() {
        console.log(this.currentDatabase)
        if (!this.currentDatabase) {
            throw new Error("Cannot read current database")
        }

        const folders = this.fs.readdirSync(this.currentDatabase)
        return folders
    }

    /** Rename (Update) the current database to the parameter given 
     * @param {String} newDatabaseName - Target name of the database
    */
    renameDatabase(newDatabaseName) {
        if (!this.currentDatabase) {
            throw new Error("Cannot read current database")
        }
        this.__verifyDatabaseName(newDatabaseName)
        if (this.__databaseExists(newDatabaseName)) {
            throw new Error("Database with same name already exists")
        }

        this.fs.renameSync(`${this.currentDatabase}`, `${this.dataPath}/${newDatabaseName}`)
        this.currentDatabase = `${this.dataPath}/${newDatabaseName}`
    }

    /** Safe delete the current database (Only delete if empty) */
    deleteDatabase() {
        if (!this.currentDatabase) {
            throw new Error("Cannot read current database")
        }

        const files = this.fs.readdirSync(`${this.currentDatabase}`)
        if (files.length > 0) {
            throw new Error('Database is not empty')
        }

        this.fs.rmdirSync(`${this.currentDatabase}`)
        this.currentDatabase = null
        return true
    }

    /** Forcefully deletes the current database (RISKY!) */
    forceDeleteDatabase() {
        if (!this.currentDatabase) {
            throw new Error("Cannot read current database")
        }

        this.fs.rmSync(`${this.currentDatabase}`, { recursive: true })
        return true
    }

    // COLLECTION CRUD OPERATIONS

    /** Creates a new collection in the current database 
     * @param {String} collectionName - Name of the new collection
    */
    createCollection(collectionName) {
        this.__verifyCollectionName(collectionName)
        if (this.__collectionExists(collectionName)) {
            throw new Error("Collection by the same name already exists")
        }

        const path = `${this.currentDatabase}/${collectionName}.json`
        this.fs.writeFileSync(`${path}`, '')
    }

    /** Reads the entire content of a collection 
     * @param {String} collectionName - Name of collection to be read
    */
    readCollection(collectionName) {
        this.__verifyCollectionName(collectionName)

        if (!this.__collectionExists(collectionName)) {
            throw new Error("Collection to be read doesn't exist")
        }

        const path = `${this.currentDatabase}/${collectionName}.json`
        // this.fs.readFile(path, 'utf8', (err, data) => {
        //     if (err) throw err
        //     console.log('File content:', JSON.parse(data))
        // })

        const data = this.fs.readFileSync(path, {
            encoding: 'utf8',
            flag: 'r'
        })

        // Parsing empty string throws an ereror 
        if (data === "") {
            return data
        }

        return JSON.parse(data)
    }

    /** Renames a table to the given parameter
     * @param {String} oldCollectionName - Old name of the collection
     * @param {String} newCollectionName - New name of the collection
     */
    renameCollection(oldCollectionName, newCollectionName) {
        this.__verifyCollectionName(newCollectionName)

        if (!this.__collectionExists(oldCollectionName)) {
            throw new Error("Collection to be renamed doesn't exist")
        }

        if (this.__collectionExists(newCollectionName)) {
            throw new Error("A collection by the new name already exists")
        }

        this.fs.renameSync(`${this.currentDatabase}/${oldCollectionName}.json`,
            `${this.currentDatabase}/${newCollectionName}.json`)

        // If the config file exists, rename that too.
        if (this.__collectionExists(`${oldCollectionName}-config`)) {
            this.fs.renameSync(
                `${this.currentDatabase}/${oldCollectionName}-config.json`,
                `${this.currentDatabase}/${newCollectionName}-config.json`
            )
        }
        return true
    }

    /** Safe Deletes the collection given as a parameter
     * @param {String} collectionName
     */
    deleteCollection(collectionName) {
        this.__verifyCollectionName(collectionName)

        if (!this.__collectionExists(collectionName)) {
            throw new Error("Collection to be deleted doesn't exist")
        }

        // If the file is empty, delete it.
        if (!this.readCollection(collectionName) === "") {
            throw new Error("Collection to be deleted is not empty!")
        }

        this.fs.rmSync(`${this.currentDatabase}/${collectionName}.json`)
        // If the config file exists, delete that too.
        if (this.__collectionExists(`${collectionName}-config`)) {
            this.fs.rmSync(
                `${this.currentDatabase}/${collectionName}-config.json`
            )
        }
    }

    /** Forcefully deletes the collection given as parameter
     * @param {String} collectionName
     */
    forceDeleteCollection(collectionName) {
        this.__verifyCollectionName(collectionName)
        if (!this.__collectionExists(collectionName)) {
            throw new Error("Collection to be deleted doesn't exist")
        }
        this.fs.rmSync(`${this.currentDatabase}/${collectionName}.json`)

        // If the config file exists, delete that too.
        if (this.__collectionExists(`${collectionName}-config`)) {
            this.fs.rmSync(
                `${this.currentDatabase}/${collectionName}-config.json`
            )
        }
    }

    /** Sets the schema for a collection.
     * @param {String} collectionName Name of collection 
     * @param {object} schema The schema object.
     */
    setSchema(collectionName, schema) {
        const schemaResult = this.__validateSchema(schema)
        if (schemaResult !== true) {
            throw new Error(schemaResult)
        }

        // Validate the collectionName
        this.__collectionExists(collectionName)

        // We don't need to check if the schema already exists, because 
        // in that case, it will be overwritten, which is expected behaviour
        // of setSchema

        // Create a new collectionName-config.json that stores the schema
        this.fs.writeFileSync(
            `${this.currentDatabase}/${collectionName}-config.json`,
            JSON.stringify(schema))
    }

    // RECORD CRUD OPERATIONS

    /** Creates a new record in the given collection
     * @param {String} collectionName - Name of collection
     * @param {object} objectToBeAdded
     */
    createRecord(collectionName, objectToBeAdded) {
        // Check if the collection exists
        this.__collectionExists(collectionName)

        // Check if the schema for that collection exists
        if (!this.fs.existsSync(
            `${this.currentDatabase}/${collectionName}-config.json`)) {
            throw new Error("Must first define schema for this collection")
        }

        // Fetch and parse the schema.
        const schema = this.__getSchema(collectionName)

        // Because conditional operators also take strings as truthy values
        if (this.__validateObject(schema, objectToBeAdded) !== true) {
            throw new Error(this.__validateObject(schema, objectToBeAdded))
        }

        const pastData = this.readCollection(collectionName)

        // If there is no pastData, write this object to it.
        if (!pastData) {
            // We are storing data as an array of JSON objects
            const newArray = []
            newArray.push(objectToBeAdded)
            this.fs.writeFileSync(
                `${this.currentDatabase}/${collectionName}.json`,
                JSON.stringify(newArray))
            return true
        }

        const jsonData = pastData

        // Just an edge case, never actually happens.
        if (!Array.isArray(jsonData)) {
            const newArray = [jsonData]
            newArray.push(objectToBeAdded)
            this.fs.writeFileSync(
                `${this.currentDatabase}/${collectionName}.json`,
                JSON.stringify(newArray)
            )
            return true
        }

        const primaryKey = this.__getPrimaryKey(schema)

        // If the primary key already exists in the array
        if (jsonData.find((record) =>
            record[primaryKey] === objectToBeAdded[primaryKey]
        ) !== undefined) {
            throw new Error(`Record with same primary key already exists`)
        }

        jsonData.push(objectToBeAdded)
        this.fs.writeFileSync(
            `${this.currentDatabase}/${collectionName}.json`,
            JSON.stringify(jsonData)
        )
    }

    /** Read the record with same primaryAttribute as the param
     * @param {String} collectionName Name of the collection to be read
     * @param {any} primaryAttribute Value of primary key of data to be read
     * @return {object|String} The record to be found, or an error message
     */
    readRecord(collectionName, primaryAttribute) {
        // Reading the collection data
        // This also makes all the verifications on the collection
        const allData = this.readCollection(collectionName)

        const schema = this.__getSchema(collectionName)

        // Fetch the primary key
        const primaryKey = this.__getPrimaryKey(schema)

        const result = allData.find((record) =>
            record[primaryKey] === primaryAttribute)


        if (result === undefined) {
            return false
        }

        return result
    }

    /** Updates a record based on it's primary key
     * @param {String} collectionName - Name of the collecion
     * @param {any} primaryAttribute - Value of primary key to search for
     * @param {object} newObjectData - New data of the object
     */
    updateRecord(collectionName, primaryAttribute, newObjectData) {
        // Reading the collection data
        // This also makes all the verifications on the collection
        const allData = this.readCollection(collectionName)

        // Getting the schema and primary key
        const schema = this.__getSchema(collectionName)
        const primaryKey = this.__getPrimaryKey(schema)

        // If the new data is trying to change primary key, reject it.
        if (primaryKey in newObjectData) {
            return `Cannot change primary key`
        }

        const result = allData.findIndex(
            (object) => object[primaryKey] === primaryAttribute)

        if (result === -1) {
            return `404: Data Not found`
        }

        // Update the data
        allData[result] = { ...allData[result], ...newObjectData }

        // Make sure the new data is Schema compliant
        const objectValidated = this.__validateObject(schema, allData[result])
        if (objectValidated === true) {
            // Write the data   
            this.fs.writeFileSync(
                `${this.currentDatabase}/${collectionName}.json`,
                JSON.stringify(allData)
            )
        }
        return objectValidated
    }

    /** Deletes an object with given primary attribute
     * @param collectionName Name of the collection
     * @param primaryAttribute
     */
    deleteRecord(collectionName, primaryAttribute) {
        // Reading the collection data
        // This also makes all the verifications on the collection
        const allData = this.readCollection(collectionName)

        // Get the schema and primary key
        const schema = this.__getSchema(collectionName)
        const primaryKey = this.__getPrimaryKey(schema)

        const result = allData.findIndex(
            (object) => object[primaryKey] === primaryAttribute)

        if (result === -1) {
            return `404: Data Not found`
        }

        allData.splice(result, 1)

        // Write back the data after being deleted
        this.fs.writeFileSync(
            `${this.currentDatabase}/${collectionName}.json`,
            JSON.stringify(allData)
        )

        return `Deletion successful`
    }
}

module.exports = Database