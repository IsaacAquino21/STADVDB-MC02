const db = require('../db');
const mysql = require('mysql2/promise')
const config = require('../models/conns')

const controller = {

	getHome: async (req, res) =>{
		const data = {
			title: "Home",
			style: ["sidebar"],
			scripts: ["sidebar", "movies-datatable"]
		}

		let n1Name = "node1"
		let n1Name2 = "node1_2"
		let n2Name = "node2"
		let n3Name = "node3"

		let part1N1 = "SELECT * FROM " + n1Name + " LIMIT 20;"
		let part2N1 = "SELECT * FROM " + n1Name2 + " LIMIT 20"
		let n2query = "SELECT * FROM " + n2Name + " LIMIT 20"
		let n3query = "SELECT * FROM " + n3Name + " LIMIT 20"


		try {
            const node1Connection = await mysql.createConnection(config.node1conn)
            const qResult = await node1Connection.query(part1N1)
			const qResult2 = await node1Connection.query(part2N1)
			node1Connection.end()

			data.dataDB1 = qResult[0]
			data.dataDB2 = qResult2[0]

			console.log("CONNECTED TO NODE 1")
            
        } catch(err) {
			// goto node 2
			try {
				const node2Connection = await mysql.createConnection(config.node2conn)
            	const qResult3 = await node2Connection.query(n2query)
				node2Connection.end()

				const node3Connection = await mysql.createConnection(config.node3conn)
				const qResult4 = await node3Connection.query(n3query)
				node3Connection.end()

				data.dataDB1 = qResult3[0]
				data.dataDB2 = qResult4[0]

				console.log("CONNECTED TO NODE 2 AND 3")

			} catch(err) {
				console.log(err)
			}
        }

		res.render('movies', data)
	},


}

module.exports = controller
