
// const mysql = require('mysql2/promise')
// const config = require('./models/conns')

// const db = {
//     getFromNode1: async (query, callback = null) => {
//         try {
//             const node1Connection = await mysql.createConnection(config.node1conn)
//             const qResult = await node1Connection.query(query)
//             node1Connection.end()

//         } catch(err) {
//             console.log(err)

//             const node2Connection = await mysql.createConnection(config.node2conn)
//             const qResult = await node2Connection.query(query)
//         }

//         node1conn.query(query, (err, result, fields) => {
//             if(err) console.log("node1" + err)

//             callback([result, err])
//         })
//     },

//     getFromNode2: async (query, callback = null) => {
//         node2conn.query(query, (err, result, fields) => {
//             if(err) console.log("node2" + err)

//             callback([result, err])
//         })
//     },

//     getFromNode3: async (query, callback = null) => {
//         node3conn.query(query, (err, result, fields) => {
//             if(err) console.log("node3" + err)

//             callback([result, err])
//         })
//     }
// }
    


// module.exports = db;