const { createPool } = require('mysql2');
const pool = createPool ({
    host: "mco2-node2.mysql.database.azure.com",
    port: "3306",
    user: "MC02GRP21",
    password: "Password!",
    database: "node2_db",
    connectionLimit: 10
})

const db = {
    getAll: (query, callback = null) => {
        pool.query(query, (err, result, fields) => {
            if(err) {
                return console.log(err)
            }

            callback(result)
        })
    }
}


module.exports = db;