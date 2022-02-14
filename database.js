const { createPool } = require('mysql');

const pool = createPool ({
    host: "localhost",
    port: "3310",
    user: "root",
    password: "12345",
    database: "imdb_import",
    connectionLimit: 10
})

// Enter Query Here
pool.query(`SELECT * FROM movies WHERE id < 99`,
    
    (err, result, fields) => {
        if (err) {
            return console.log(err);
        }
        return console.log(result);
})

module.exports = pool;
