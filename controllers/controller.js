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
			scripts: ["sidebar", "admin-product-modal", "modify_movie"]
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

	getMovieAdd: (req, res) => {
		const data = {
			title: "Home",
			styles: ["sidebar"],
			scripts: ["sidebar", "movies-datatable", "admin-product-modal", "movie-add"]
		}

		res.render('movie-add', data)
	},

	// lagay sa node2 or 3 + logic if down ung node1
	postAddMovie: async (req, res) => {
		const movieName = req.body.movieName
		const movieYear = parseInt(req.body.movieYear)
		const movieRank = parseFloat(req.body.movieRank)
		
		try {
			if(movieYear < 1980) {
				// insert in node 1 table 1
				const node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("start transaction;")
				await node1Connection.query("lock tables node1 write;")
				await node1Connection.query("INSERT INTO node1 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				await node1Connection.query("commit;")
				await node1Connection.query("unlock tables;")
				console.log("SUCCESSFULLY INSERTED TO NODE1 TABLE1")
				node1Connection.end()

				// insert in node 2
				const node2Connection = await mysql.createConnection(config.node2conn)
				await node2Connection.query("set autocommit = 0;")
				await node2Connection.query("start transaction;")
				await node2Connection.query("lock tables node2 write;")
				await node2Connection.query("INSERT INTO node2 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				await node2Connection.query("commit;")
				await node2Connection.query("unlock tables;")
				console.log("INSERTED")
				
				node2Connection.end()

			} else {
				const node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("start transaction;")
				await node1Connection.query("lock tables node1_2 write;")
				await node1Connection.query("INSERT INTO node1_2 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				await node1Connection.query("commit;")
				await node1Connection.query("unlock tables;")
				console.log("SUCCESSFULLY INSERTED TO NODE1 TABLE1")
				node1Connection.end()

				// insert in node 3
				const node3Connection = await mysql.createConnection(config.node2conn)
				await node3Connection.query("set autocommit = 0;")
				await node3Connection.query("start transaction;")
				await node3Connection.query("lock tables node3 write;")
				await node3Connection.query("INSERT INTO node3 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				await node3Connection.query("commit;")
				await node3Connection.query("unlock tables;")
				console.log("INSERTED")
				
				node3Connection.end()
			}
			// connect to node 1
			


		} catch(err) {
			// if less than 1980, query in node 2
			if(movieYear < 1980) {
				const node2Connection = await mysql.createConnection(config.node2conn)
				await node2Connection.query("set autocommit = 0;")
				await node2Connection.query("start transaction;")
				await node2Connection.query("lock tables node2 write;")
				await node2Connection.query("INSERT INTO node2 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				await node2Connection.query("commit;")
				await node2Connection.query("unlock tables;")
				console.log("INSERTED")
				
				node2Connection.end()
		
			} else {
				// if >= 1980, query in node3
				const node3Connection = await mysql.createConnection(config.node2conn)
				await node3Connection.query("set autocommit = 0;")
				await node3Connection.query("start transaction;")
				await node3Connection.query("lock tables node3 write;")
				await node3Connection.query("INSERT INTO node3 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				await node3Connection.query("commit;")
				await node3Connection.query("unlock tables;")
				console.log("INSERTED")
				
				node3Connection.end()
			}
		}

		
		// false pag di na add sa node 1/node2 or 3
		res.send(true)
	},

	postUpdateMovie: async (req, res) => {
		const data = {
			id: parseInt(req.body.id),
			name: req.body.name,
			year: parseInt(req.body.year),
			rank: parseFloat(req.body.rank)
		}

		// + logic, check what yr < 1980, and >- 1980

		const node1Connection = await mysql.createConnection(config.node1conn)
		await node1Connection.query("set autocommit = 0;")
		await node1Connection.query("start transaction;")
		await node1Connection.query("lock tables node1 write;")
		await node1Connection.query("UPDATE node1 SET `name` = '" + data.name + "'," + "`year` = " + data.year + "," + "`rank` = " + data.rank + " WHERE id = " + data.id + ";" )
		await node1Connection.query("commit;")
		await node1Connection.query("unlock tables;")
		console.log("SUCCESSFULLY UPDATED MOVIE ID = " + data.id + " TO NODE1 TABLE1")
		node1Connection.end()

		res.send(true)
	},

	postDeleteMovie: async (req, res) => {
		// prompt after deleting
		const id = parseInt(req.body.id)

		const node1Connection = await mysql.createConnection(config.node1conn)
		await node1Connection.query("set autocommit = 0;")
		await node1Connection.query("start transaction;")
		await node1Connection.query("lock tables node1 write;")
		await node1Connection.query("DELETE FROM node1 WHERE id = " + id + ";")
		await node1Connection.query("commit;")
		await node1Connection.query("unlock tables;")
		console.log("SUCCESSFULLY DELETED MOVIE ID = " + id + " TO NODE1 TABLE1")
		node1Connection.end()

		res.send(true)
	}
}

module.exports = controller