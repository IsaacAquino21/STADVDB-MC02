const node1conn = {
    host: "mc02-node.mysql.database.azure.com",
    port: "3306",
    user: "MC02GRP21",
    password: "Password!",
    database: "node1_db",
    connectionLimit: 10,
    multipleStatements: true
}

const node2conn = {
    host: "mco2-node2.mysql.database.azure.com",
    port: "3306",
    user: "MC02GRP21",
    password: "Password!",
    database: "node2_db",
    connectionLimit: 10,
    multipleStatements: true
}

const node3conn = {
    host: "mc02-node3.mysql.database.azure.com",
    port: "3306",
    user: "MC02GRP21",
    password: "Password!",
    database: "node3_db",
    connectionLimit: 10,
    multipleStatements: true
}

module.exports = { node1conn, node2conn, node3conn }