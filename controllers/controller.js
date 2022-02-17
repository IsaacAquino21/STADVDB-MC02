const db = require('../db');
const mysql = require('mysql2/promise')
const config = require('../models/conns')

const controller = {

	getHome: async (req, res) => {
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

		} catch (err) {
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

			} catch (err) {
				console.log(err)
			}
		}

		res.render('movies', data)
	},

	/**
	 * This GET method returns one movie page
	 * @param {*} req 
	 * @param {*} res 
	 */
	getMoviePage: async (req, res) => {
		var data = {
			title: "Home",
			styles: ["sidebar"],
			scripts: ["sidebar", "admin-product-modal", "modify_movie"]
		}

		// get id and year from url params
		const id = req.params.id
		const year = req.params.year

		// console.log(id + " " + year)

		if (year < 1980) {
			// select from node 1
			try {
				// throw Error // simulate node 1 down
				const node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("start transaction;")
				await node1Connection.query("lock tables node1 read;")
				const [rows, fields] = await node1Connection.query("SELECT * FROM node1 WHERE id = ? ;", [id])
				await node1Connection.query("commit;")
				await node1Connection.query("unlock tables;")

				// const [rows, fields] = await connection.execute('SELECT * FROM `table` WHERE `name` = ? AND `age` > ?', ['Morty', 14]);


				console.log('Successfully queried in node1 table1')

				console.log(rows)

				data.dataDB = rows[0]

				node1Connection.end()

			} catch (err) {
				console.log(err)
				// select from node 2, assume node 1 down
				try {
					// throw Error // simulate node 2 down
					const node2Connection = await mysql.createConnection(config.node2conn)
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("start transaction;")
					await node2Connection.query("lock tables node2 read;")
					const [rows, fields] = await node2Connection.query("SELECT * FROM node2 WHERE id = ?;", [id])
					await node2Connection.query("commit;")
					await node2Connection.query("unlock tables;")
					console.log("Successfully queried in node2")

					data.dataDB = rows[0]

					node2Connection.end()

				} catch (err) {
					console.log(err + "ERROR SA SECOND CATCH")
					res.redirect('/error-500')
				}
			}

		} else if(year >= 1980) { 
			// select from node 1 table 2
			try {
				// throw Error // simulate node 1 down
				const node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("start transaction;")
				await node1Connection.query("lock tables node1_2 read;")
				const [rows, fields] = node1Connection.query("SELECT * FROM node1_2 WHERE id = ?;", [id])
				await node1Connection.query("commit;")
				await node1Connection.query("unlock tables;")

				data.dataDB = rows[0]

				console.log('Successfully queried in node1_2 table1')

				node1Connection.end()
			} catch (err) {
				// select from node 3
				try {
					const node3Connection = await mysql.createConnection(config.node3conn)
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("start transaction;")
					await node3Connection.query("lock tables node3 read;")
					const [rows, fields] = await node3Connection.query("SELECT * FROM node3 WHERE id = ?;", [id])
					await node3Connection.query("commit;")
					await node3Connection.query("unlock tables;")
					console.log("Successfully queried in node3")

					data.dataDB = rows[0]

					node3Connection.end()
				} catch (err) {
					res.redirect('/error-500')
				}
			}
		}

		res.render('movie-page', data)
	},

	/**
	 * This GET method renders movie add page
	 * @param {*} req 
	 * @param {*} res 
	 */
	getMovieAdd: (req, res) => {
		const data = {
			title: "Home",
			styles: ["sidebar"],
			scripts: ["sidebar", "movies-datatable", "admin-product-modal", "movie-add"]
		}

		res.render('movie-add', data)
	},

	/**
	 * This POST method inserts a movie into the DB
	 * @param {*} req 
	 * @param {*} res 
	 */
	postAddMovie: async (req, res) => {
		const movieName = req.body.movieName
		const movieYear = parseInt(req.body.movieYear)
		const movieRank = parseFloat(req.body.movieRank)
		var flag = false

		if (movieYear < 1980) {
			// insert to node 1
			try {
				// insert in node 1 table 1
				const node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("start transaction;")
				await node1Connection.query("lock tables node1 write;")
				await node1Connection.query("INSERT INTO node1 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				await node1Connection.query("commit;")
				await node1Connection.query("unlock tables;")
				console.log("Inserted to node 1 table 1")
				node1Connection.end()

				flag = true

			} catch (err) {
				console.log(err + "ERROR SA NODE 1")
				// insert to node 2 if node 1 isn't successful
				try {
					const node2Connection = await mysql.createConnection(config.node2conn)
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("start transaction;")
					await node2Connection.query("lock tables node2 write;")
					await node2Connection.query("INSERT INTO node2 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
					await node2Connection.query("commit;")
					await node2Connection.query("unlock tables;")
					console.log("Inserted to node 2, error node 1")

					node2Connection.end()

					// create log to put to node 2 na uncommitted ung last query, tas after, query in node 1 pag naka recover na

				} catch (err) {
					res.redirect('/error-500')
				}
			}

			if (flag) {
				try {
					const node2Connection = await mysql.createConnection(config.node2conn)
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("start transaction;")
					await node2Connection.query("lock tables node2 write;")
					await node2Connection.query("INSERT INTO node2 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
					await node2Connection.query("commit;")
					await node2Connection.query("unlock tables;")
					console.log("Inserted to node 2 no error sa node 1")

					node2Connection.end()
				} catch (err) {
					// log to node 1 na di gumana ung node 2, may uncommitted sa node 2, node 1 = on

				}
			}
			// insert to node 2 if node 1 is successful


		} else {
			try {
				const node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("start transaction;")
				await node1Connection.query("lock tables node1_2 write;")
				await node1Connection.query("INSERT INTO node1_2 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				await node1Connection.query("commit;")
				await node1Connection.query("unlock tables;")
				console.log("Inserted to node 1 table 2")
				node1Connection.end()

				flag = true
			} catch (err) {
				try {
					const node3Connection = await mysql.createConnection(config.node2conn)
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("start transaction;")
					await node3Connection.query("lock tables node3 write;")
					await node3Connection.query("INSERT INTO node3 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
					await node3Connection.query("commit;")
					await node3Connection.query("unlock tables;")
					console.log("Inserted to node 3 error node 1")

					node3Connection.end()

					//
				} catch (err) {
					res.redirect('/error-500')
				}
			}

			if (flag) {
				// insert to node 3 if node 1 is successful
				try {
					const node3Connection = await mysql.createConnection(config.node3conn)
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("start transaction;")
					await node3Connection.query("lock tables node3 write;")
					await node3Connection.query("INSERT INTO node3 (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
					await node3Connection.query("commit;")
					await node3Connection.query("unlock tables;")
					console.log("Inserted to node 3 no errors sa node 1")

					node3Connection.end()
				} catch (err) {
					// log to node 1 na di gumana ung node 3, may uncommitted sa node 3, node 1 = on, tas i query sa node 3 ung logged sa node 1

				}
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

		var flag = false

		// + logic, check what yr < 1980, and >- 1980

		if(data.year < 1980) {
			try {
				// throw Error // simulate off node 1
				// update node1
				const node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("start transaction;")
				await node1Connection.query("lock tables node1 write;")
				await node1Connection.query("UPDATE node1 SET `name` = '" + data.name + "'," + "`year` = " + data.year + "," + "`rank` = " + data.rank + " WHERE id = " + data.id + ";")
				
				await node1Connection.query("commit;")
				await node1Connection.query("unlock tables;")
				console.log("SUCCESSFULLY UPDATED MOVIE ID = " + data.id + " FROM NODE1 TABLE1")
				node1Connection.end()

				flag = true

				res.send(true)
			} catch(err) {
				// update node 2
				try {
					// throw Error // simulate off node node 2
					const node2Connection = await mysql.createConnection(config.node2conn)
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("start transaction;")
					await node2Connection.query("lock tables node2 write;")
					await node2Connection.query("UPDATE node2 SET `name` = '" + data.name + "'," + "`year` = " + data.year + "," + "`rank` = " + data.rank + " WHERE id = " + data.id + ";")
					
					await node2Connection.query("commit;")
					await node2Connection.query("unlock tables;")
					console.log("SUCCESSFULLY UPDATED MOVIE ID = " + data.id + " FROM NODE1 TABLE1")
					node2Connection.end()

					res.send(true)
				} catch(err) {
					console.log(err + "ERROR SA SECOND CATCH")
					res.send(false)
				}
			}

			if(flag) {
				// insert to node 2 if node 1 is successful
				try {
					const node2Connection = await mysql.createConnection(config.node2conn)
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("start transaction;")
					await node2Connection.query("lock tables node2 write;")
					await node2Connection.query("UPDATE node2 SET `name` = '" + data.name + "'," + "`year` = " + data.year + "," + "`rank` = " + data.rank + " WHERE id = " + data.id + ";")
					await node2Connection.query("commit;")
					await node2Connection.query("unlock tables;")
					console.log("Updated node 2 no errors sa node 1")
	
					node2Connection.end()

				} catch (err) {
					// log to node 1 na di gumana ung node 3, may uncommitted sa node 3, node 1 = on, tas i query sa node 3 ung logged sa node 1
	
				}
			}

		} else if(data.year >= 1980) {
			try {
				// update node1_2
				const node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("start transaction;")
				await node1Connection.query("lock tables node1_2 write;")
				await node1Connection.query("UPDATE node1_2 SET `name` = '" + data.name + "'," + "`year` = " + data.year + "," + "`rank` = " + data.rank + " WHERE id = " + data.id + ";")
				
				await node1Connection.query("commit;")
				await node1Connection.query("unlock tables;")
				console.log("SUCCESSFULLY UPDATED MOVIE ID = " + data.id + " FROM NODE1_2 TABLE1")
				node1Connection.end()

				flag = true

				res.send(true)
			} catch(err) {
				// update node 2
				try {
					const node3Connection = await mysql.createConnection(config.node3conn)
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("start transaction;")
					await node3Connection.query("lock tables node3 write;")
					await node3Connection.query("UPDATE node3 SET `name` = '" + data.name + "'," + "`year` = " + data.year + "," + "`rank` = " + data.rank + " WHERE id = " + data.id + ";")
					
					await node3Connection.query("commit;")
					await node3Connection.query("unlock tables;")
					console.log("SUCCESSFULLY UPDATED MOVIE ID = " + data.id + " FROM NODE1 TABLE1")
					node3Connection.end()

					res.send(true)
				} catch(err) {
					res.send(false)
				}
			}

			if(flag) {
				// insert to node 2 if node 1 is successful
				try {
					const node3Connection = await mysql.createConnection(config.node3conn)
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("start transaction;")
					await node3Connection.query("lock tables node3 write;")
					await node3Connection.query("UPDATE node3 SET `name` = '" + data.name + "'," + "`year` = " + data.year + "," + "`rank` = " + data.rank + " WHERE id = " + data.id + ";")
					await node3Connection.query("commit;")
					await node3Connection.query("unlock tables;")
					console.log("Inserted to node 3 no errors sa node 1")
	
					node3Connection.end()

				} catch (err) {
					// log to node 1 na di gumana ung node 3, may uncommitted sa node 3, node 1 = on, tas i query sa node 3 ung logged sa node 1
					
				}
			}
		}
	},

	postDeleteMovie: async (req, res) => {
		const id = parseInt(req.body.id)
		const year = parseInt(req.body.year)
		var flag = false
		// delete from node 1
		if(year < 1980) {
			try {
				// throw Error // simulate node 1 off
				const node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("start transaction;")
				await node1Connection.query("lock tables node1 write;")
				await node1Connection.query("DELETE FROM node1 WHERE id = " + id + ";")
				await node1Connection.query("commit;")
				await node1Connection.query("unlock tables;")
				console.log("SUCCESSFULLY DELETED MOVIE ID = " + id + " FROM NODE1 TABLE1")
				node1Connection.end()

				flag = true
	
				res.send(true)
			} catch(err) {
				// delete from node 2, error node 1
				try {
					// throw Error // simulate node 1 off
					const node2Connection = await mysql.createConnection(config.node2conn)
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("start transaction;")
					await node2Connection.query("lock tables node2 write;")
					await node2Connection.query("DELETE FROM node2 WHERE id = " + id + ";")
					await node2Connection.query("commit;")
					await node2Connection.query("unlock tables;")
					console.log("SUCCESSFULLY DELETED MOVIE ID = " + id + " FROM NODE2")
					node2Connection.end()
	
					res.send(true)
				} catch(err) {
					res.send(false)
				}
			}

			if(flag) {
				try {
					const node2Connection = await mysql.createConnection(config.node2conn)
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("start transaction;")
					await node2Connection.query("lock tables node2 write;")
					await node2Connection.query("DELETE FROM node2 WHERE id = " + id + ";")
					await node2Connection.query("commit;")
					await node2Connection.query("unlock tables;")
					console.log("SUCCESSFULLY DELETED MOVIE ID = " + id + " FROM NODE2")
					node2Connection.end()

					res.send(true)
				} catch(err) {
					// log to node 1 na di gumana ung node 2, may uncommitted sa node 2, node 1 = on, tas i query sa node 2 ung logged sa node 1
				}
				
			}


		} else if (year >= 1980) {
			try {
				console.log("PUMASOK SA TRY")
				const node1Connection = await mysql.createConnection(config.node1conn)
				console.log("CONNECTED")
				await node1Connection.query("set autocommit = 0;")
				console.log("AUTOCOMMIT")
				await node1Connection.query("start transaction;")
				console.log("START TX")
				await node1Connection.query("lock tables node1_2 write;")
				// console.log("LOCK TABLES")
				await node1Connection.query("DELETE FROM node1_2 WHERE id = " + id + ";")
				console.log("DELETE QUERY")
				await node1Connection.query("commit;")
				console.log("COMMIT")
				await node1Connection.query("unlock tables;")
				// console.log("UNLOCK TABLES")
				console.log("SUCCESSFULLY DELETED MOVIE ID = " + id + " FROM NODE1 TABLE2")
				node1Connection.end()

				flag = true
				
				res.send(true)
			} catch(err) {
				console.log(err + "NAG ERR")
				// delete from node 2, error node 1
				try {
					const node3Connection = await mysql.createConnection(config.node3conn)
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("start transaction;")
					await node3Connection.query("lock tables node3 write;")
					await node3Connection.query("DELETE FROM node3 WHERE id = " + id + ";")
					await node3Connection.query("commit;")
					await node3Connection.query("unlock tables;")
					console.log("SUCCESSFULLY DELETED MOVIE ID = " + id + " FROM NODE3")
					node3Connection.end()
	
					res.send(true)
				} catch(err) {
					res.send(false)
				}
			}

			if(flag) {
				try {
					const node3Connection = await mysql.createConnection(config.node3conn)
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("start transaction;")
					await node3Connection.query("lock tables node3 write;")
					await node3Connection.query("DELETE FROM node3 WHERE id = " + id + ";")
					await node3Connection.query("commit;")
					await node3Connection.query("unlock tables;")
					console.log("SUCCESSFULLY DELETED MOVIE ID = " + id + " FROM NODE3")
					node3Connection.end()

					res.send(true)
				} catch(err) {
					// log to node 1 na di gumana ung node 2, may uncommitted sa node 2, node 1 = on, tas i query sa node 2 ung logged sa node 1
				}
				
			}
		}
		
	},

	getError500: (req, res) => {
		const data = {
			title: "Home",
			styles: ["sidebar"],
			scripts: ["sidebar", "movies-datatable", "admin-product-modal"]
		}

		res.render('error-500', data)
	}
}

module.exports = controller