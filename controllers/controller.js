const db = require('../db');
const mysql = require('mysql2/promise')
const config = require('../models/conns')

const controller = {

	getHome: async (req, res) =>{
		const data = {
			title: "Home",
			styles: ["sidebar"],
			scripts: ["sidebar", "movies-datatable", "admin-product-modal"]
		}

		let n1Name = "node1"
		let n1Name2 = "node1_2"
		let n2Name = "node2"
		let n3Name = "node3"

		let part1N1 = "SELECT * FROM " + n1Name + ";"
		let part2N1 = "SELECT * FROM " + n1Name2 + ";"
		let n2query = "SELECT * FROM " + n2Name + ";"
		let n3query = "SELECT * FROM " + n3Name + ";"


		try {
            const node1Connection = await mysql.createConnection(config.node1conn)

			// // set autocommit to 0
			// node1Connection.query("set autocommit = 0;")

			// // start tx
			// node1Connection.query("start transaction;")

			// // 

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

	getMoviePage: async (req, res) => {
		const data = {
			title: "Home",
			styles: ["sidebar"],
			scripts: ["sidebar", "movies-datatable", "admin-product-modal"]
		}

		// get id and year from url params
		const id = req.params.id
		const year = req.params.year

		console.log(id + " " + year)

		try {
			// throw Error // simulate off node 1

			// var blob = new Blob(["SELECT * FROM node1 where `id` = " + id + ";"], {type: "text/plain;charset=utf-8"})

			// saveAs(blob, "logs.txt")

			// console.log('LOG SAVED')

			// check if table1 or table2
			if(year < 1980) {
				// query in table1
				const node1Connection = await mysql.createConnection(config.node1conn)
				const qResult = await node1Connection.query("SELECT * FROM node1 where `id` = " + id + ";")
				data.dataDB = qResult[0][0]

				console.log('SUCCESSFULLY QUERIED IN NODE 1 TABLE 1')

				node1Connection.end()
			} else {
				const node1Connection = await mysql.createConnection(config.node1conn)
				const qResult = await node1Connection.query("SELECT * FROM node1_2 where `id` = " + id + ";")
				data.dataDB = qResult[0][0]

				console.log('SUCCESSFULLY QUERIED IN NODE 1 TABLE 2')

				node1Connection.end()
			}

		// assume: node 1 is closed, query in node2 or node3
		} catch(err) {
			// check if query in node 2 or 3
			if(year < 1980) {
				// query in node 2, year <= 1980
				try {
					const node2Connection = await mysql.createConnection(config.node2conn)
					const qResult2 = await node2Connection.query("SELECT * FROM node2 where `id` = " + id + ";")
					data.dataDB = qResult2[0][0]

					console.log('SUCCESSFULLY QUERIED IN NODE 2')

					node2Connection.end()
				} catch(err) {
					console.log(err)
				}

			} else {
				// query in node 3, year >= 1980
				try {
					const node3Connection = await mysql.createConnection(config.node2conn)
					const qResult3 = await node3Connection.query("SELECT * FROM node2 where `id` = " + id + ";")
					data.dataDB = qResult3[0][0]

					console.log('SUCCESSFULLY QUERIED IN NODE 3')

					node3Connection.end()
				} catch(err) {
					console.log(err)
				}
			}
		}

		res.render('movie-page', data)
	},

	// postReadOneMovie: (req, res) => {
	// 	const data = req.body

	// 	if(JSON.stringify(data.id) != "") {
	// 		console.log(JSON.stringify(data))
	// 	}
		
	// 	res.redirect('/movie-page')
	// }


}

module.exports = controller
