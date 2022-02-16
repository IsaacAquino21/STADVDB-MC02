const { createPool } = require('mysql2');

const node1conn = createPool ({
    host: "mc02-node.mysql.database.azure.com",
    port: "3306",
    user: "MC02GRP21",
    password: "Password!",
    database: "node1_db",
    connectionLimit: 10,
    multipleStatements: true
})

const node2conn = createPool ({
    host: "mco2-node2.mysql.database.azure.com",
    port: "3306",
    user: "MC02GRP21",
    password: "Password!",
    database: "node2_db",
    connectionLimit: 10,
    multipleStatements: true
})

const node3conn = createPool ({
    host: "mc02-node3.mysql.database.azure.com",
    port: "3306",
    user: "MC02GRP21",
    password: "Password!",
    database: "node3_db",
    connectionLimit: 10,
    multipleStatements: true
})

const db = {
    getFromNode1: async (query, callback = null) => {
        node1conn.query(query, (err, result, fields) => {
            if(err) console.log(err)

            callback([result, err])
        })
    },

    getFromNode2: async (query, callback = null) => {
        node2conn.query(query, (err, result, fields) => {
            if(err) console.log(err)

            callback([result, err])
        })
    },

    getFromNode3: async (query, callback = null) => {
        node3conn.query(query, (err, result, fields) => {
            if(err) console.log(err)

            callback([result, err])
        })
    }
}
    


module.exports = db;