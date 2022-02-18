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

		var node1Connection
		var node2Connection
		var node3Connection


		try {
			node1Connection = await mysql.createConnection(config.node1conn)

			// // set autocommit to 0
			// node1Connection.query("set autocommit = 0;")

			// // start tx
			// node1Connection.query("START TRANSACTION;")

			// // 

			const qResult = await node1Connection.query(part1N1)
			const qResult2 = await node1Connection.query(part2N1)
			node1Connection.end()

			data.dataDB1 = qResult[0]
			data.dataDB2 = qResult2[0]

			console.log("CONNECTED TO NODE 1")

		} catch (err) {
			if(node1Connection != null) {
				node1Connection.end()
			}
			
			// goto node 2
			try {
				node2Connection = await mysql.createConnection(config.node2conn)
				const qResult3 = await node2Connection.query(n2query)

				
				node2Connection.end()

				node3Connection = await mysql.createConnection(config.node3conn)
				const qResult4 = await node3Connection.query(n3query)
				node3Connection.end()

				data.dataDB1 = qResult3[0]
				data.dataDB2 = qResult4[0]

				console.log("CONNECTED TO NODE 2 AND 3")

			} catch (err) {
				if(node2Connection != null) {
					node2Connection.end()
				}

				if(node3Connection != null) {
					node3Connection.end()
				}
				
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
		var node1Connection;
		var node2Connection;
		var node3Connection;

		// console.log(id + " " + year)

		if (year < 1980) {
			// select from node 1
			try {
				// throw Error // simulate node 1 down
				node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("START TRANSACTION;")
				await node1Connection.query("lock tables node1 read;")
				const [rows, fields] = await node1Connection.query("SELECT * FROM node1 WHERE id = ? ;", [id])
				await node1Connection.query("COMMIT;")
				await node1Connection.query("UNLOCK TABLES;")

				// const [rows, fields] = await connection.execute('SELECT * FROM `table` WHERE `name` = ? AND `age` > ?', ['Morty', 14]);


				console.log('Successfully queried in node1 table1')

				console.log(rows)

				data.dataDB = rows[0]

				node1Connection.end()

			} catch (err) {
				console.log(err)
				if (node1Connection != null) {
					node1Connection.end()
				}
				
				// select from node 2, assume node 1 down
				try {
					// throw Error // simulate node 2 down
					node2Connection = await mysql.createConnection(config.node2conn)
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("START TRANSACTION;")
					await node2Connection.query("lock tables node2 read;")
					const [rows, fields] = await node2Connection.query("SELECT * FROM node2 WHERE id = ?;", [id])
					await node2Connection.query("COMMIT;")
					await node2Connection.query("UNLOCK TABLES;")
					console.log("Successfully queried in node2")

					data.dataDB = rows[0]

					node2Connection.end()

				} catch (err) {
					if (node2Connection != null) {
						node2Connection.end()
					}
					
					console.log(err + "ERROR SA SECOND CATCH")
					res.redirect('/error-500')
				}
			}

		} else if (year >= 1980) {
			// select from node 1 table 2
			try {
				// throw Error // simulate node 1 down
				node1Connection = await mysql.createConnection(config.node1conn)
				await node1Connection.query("START TRANSACTION;")
				await node1Connection.query("lock tables node1_2 read;")
				const [rows, fields] = await node1Connection.query("SELECT * FROM node1_2 WHERE id = ?;", [id])
				await node1Connection.query("COMMIT;")
				await node1Connection.query("UNLOCK TABLES;")

				data.dataDB = rows[0]

				console.log('Successfully queried in node1 table node1_2')

				node1Connection.end()
			} catch (err) {
				if (node1Connection != null) {
					node1Connection.end()
				}
				console.log(err)
				// select from node 3

				try {
					node3Connection = await mysql.createConnection(config.node3conn)
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("START TRANSACTION;")
					await node3Connection.query("lock tables node3 read;")
					const [rows, fields] = await node3Connection.query("SELECT * FROM node3 WHERE id = ?;", [id])
					await node3Connection.query("COMMIT;")
					await node3Connection.query("UNLOCK TABLES;")
					console.log("Successfully queried in node3")

					data.dataDB = rows[0]

					node3Connection.end()
				} catch (err) {
					if (node3Connection != null) {
						node3Connection.end()
					}
					node3Connection.end()
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
			title: "All Movies",
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
		var flag2 = false
		var node1Connection;
		var node2Connection;
		var node3Connection;
		var nodeLogsConnection;

		if (movieYear < 1980) {
			// insert to node 1
			try {
				// throw Error // simulate
				// insert in node 1 table 1
				// connections
				node1Connection = await mysql.createConnection(config.node1conn)
				nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)

				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("START TRANSACTION;")
				await node1Connection.query("LOCK TABLES node1 write;")

				// insert in logs
				await nodeLogsConnection.query("INSERT INTO `node1_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node1');")
				console.log("Start log inserted to node 1 table 1")

				// insert new movie
				await node1Connection.query("INSERT INTO `node1` (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				
				// update logs 
				await nodeLogsConnection.query("UPDATE `node1_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node1';", [movieName])
				// await nodeLogsConnection.query("UPDATE `node1_logs` SET `status` = 'write' WHERE `name` = '" + movieName + "' AND `dest` = 'node1';")
				console.log("Log updated to write in node 1 table 1")
				await node1Connection.query("COMMIT;")
				await node1Connection.query("UNLOCK TABLES;")

				// update logs
				await nodeLogsConnection.query('UPDATE `node1_logs` SET `status` = ? WHERE `name` = ? AND `dest` = ?;', ['committing', movieName, 'node1'])
				console.log("Log updated to committing in node 1 table 1")
				await nodeLogsConnection.query('UPDATE `node1_logs` SET `status` = ? WHERE `name` = ? AND `dest` = ?;', ['committed', movieName, 'node1'])
				console.log("Log updated to committed in node 1 table 1")
				console.log("Inserted to node 1 table 1")

				// end connections
				node1Connection.end()
				nodeLogsConnection.end()

				flag = true

			} catch (err) {
				console.log(err)
				if (node1Connection != null) {
					node1Connection.end()
				}
				if (nodeLogsConnection != null) {
					nodeLogsConnection.end()
				}

				// insert to node 2 if node 1 isn't successful
				try {
					// throw Error // simulate
					node2Connection = await mysql.createConnection(config.node2conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)

					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("START TRANSACTION;")
					await node2Connection.query("LOCK TABLES node2 write;")

					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node2');")
					console.log("Start log inserted to node 2")

					// insert new movie
					await node2Connection.query("INSERT INTO `node2` (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node2';", [movieName])
					console.log("Log updated to write in node 2")
					await node2Connection.query("COMMIT;")
					await node2Connection.query("UNLOCK TABLES;")

					// update logs
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2';", ['committing', movieName])
					console.log("Log updated to committing in node 2")
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2';", ['committed', movieName])
					console.log("Log updated to committed in node 2")
					console.log("Inserted to node 2")

					// log na nag fail sa node 1
					await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node1');")
					console.log("Successful insert in node2 but unsuccessful in node1")

					// end connections
					node2Connection.end()
					nodeLogsConnection.end()

					// create log to put to node 2 na unCOMMITted ung last query, tas after, query in node 1 pag naka recover na

				} catch (err) {
					var flag2 = true
					console.log(err)
					if (node2Connection != null) {
						node2Connection.end()
					}

					if (nodeLogsConnection != null) {
						nodeLogsConnection.end()
					}

					// update logs status = terminated, since nag error sa lahat
					try {
						nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)

						await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node2');")
						console.log("Logs in node2_logs terminated")

						await nodeLogsConnection.query("INSERT INTO `node1_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node1');")
						console.log("Logs in node1_logs terminated")

					} catch(err) {
						console.log(err)
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}

					
				}
			}

			if (flag) {
				try {
					// throw Error // simulate
					node2Connection = await mysql.createConnection(config.node2conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)

					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("START TRANSACTION;")
					await node2Connection.query("LOCK TABLES node2 write;")

					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node2');")
					console.log("Start log inserted to node 2")

					// insert new movie
					await node2Connection.query("INSERT INTO `node2` (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node2';", [movieName])
					console.log("Log updated to write in node 2")
					await node2Connection.query("COMMIT;")
					await node2Connection.query("UNLOCK TABLES;")

					// update logs
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2'", ['committing', movieName])
					console.log("Log updated to committing in node 2")
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2';", ['committed', movieName])
					console.log("Log updated to committed in node 2")
					console.log("Inserted to node 2 no error in node 1")

					// end connections
					node2Connection.end()
					nodeLogsConnection.end()
				} catch (err) {
					// log to node 1 na di gumana ung node 2, may unCOMMITted sa node 2, node 1 = on RECOVERY
					if (node2Connection != null) {
						node2Connection.end()
					}

					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)

					// create log in node1 na di pumasok sa node 2 ung insert, pero successful in node 1
					// log na nag fail sa node 2
					try {
						
						await nodeLogsConnection.query("INSERT INTO `node1_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node2');")
						console.log("Successful insert in node1 but unsuccessful in node2")
						nodeLogsConnection.end()
					} catch(err) {
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
				}
			}


		} else if (movieYear >= 1980) {
			try {
				// throw Error // simulate
				node1Connection = await mysql.createConnection(config.node1conn)
				nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)

				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("START TRANSACTION;")
				await node1Connection.query("LOCK TABLES node1_2 write;")

				// insert in logs
				await nodeLogsConnection.query("INSERT INTO `node1_2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node1_2');")
				console.log("Start log inserted to node 1 table 2")

				// insert new movie
				await node1Connection.query("INSERT INTO `node1_2` (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
				
				// update logs 
				await nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node1_2';", [movieName])
				console.log("Log updated to write in node 1 table 2")
				await node1Connection.query("COMMIT;")
				await node1Connection.query("UNLOCK TABLES;")

				// update logs
				await nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node1_2';", ['committing', movieName])
				console.log("Log updated to committing in node 1 table 2")
				await nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node1_2';", ['committed', movieName])
				console.log("Log updated to committed in node 1 table 2")
				console.log("Inserted to node 1 table 2")

				// end connections
				node1Connection.end()
				nodeLogsConnection.end()

				flag = true
			} catch (err) {
				if (node1Connection != null) {
					node1Connection.end()
				}

				if (nodeLogsConnection != null) {
					nodeLogsConnection.end()
				}

				try {
					// throw Error // simulate
					node3Connection = await mysql.createConnection(config.node3conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)

					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("START TRANSACTION;")
					await node3Connection.query("LOCK TABLES node3 write;")

					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node3');")
					console.log("Start log inserted to node3")

					// insert new movie
					await node3Connection.query("INSERT INTO `node3` (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node3';", [movieName])
					console.log("Log updated to write in node3")
					await node3Connection.query("COMMIT;")
					await node3Connection.query("UNLOCK TABLES;")

					// update logs
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committing', movieName])
					console.log("Log updated to committing in node3")
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committed', movieName])
					console.log("Log updated to committed in node3")
					console.log("Inserted to node3")

					// log na nag fail sa node 1
					await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node1_2');")
					console.log("Successful insert in node3 but unsuccessful in node1")

					// end connections
					node3Connection.end()
					nodeLogsConnection.end()

					//
				} catch (err) {
					flag2 = true
					if (node3Connection != null) {
						node3Connection.end()
					}

					if (nodeLogsConnection != null) {
						node3Connection.end()
					}

					// update logs status = terminated, since nag error sa lahat
					try {
						nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)

						await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node3');")
						console.log("Logs in node3_logs terminated")

						await nodeLogsConnection.query("INSERT INTO `node1_2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node1');")
						console.log("Logs in node1_logs terminated")

					} catch(err) {
						console.log(err)
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
				}
			}

			if (flag) {
				// insert to node 3 if node 1 is successful
				try {
					// throw Error // simulate
					node3Connection = await mysql.createConnection(config.node3conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)

					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("START TRANSACTION;")
					await node3Connection.query("LOCK TABLES node3 write;")

					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node3');")
					console.log("Start log inserted to node3")

					// insert new movie
					await node3Connection.query("INSERT INTO `node3` (`name`, `year`, `rank`) values ('" + movieName + "'," + movieYear + "," + movieRank + ");")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node3';", [movieName])
					console.log("Log updated to write in node3")
					await node3Connection.query("COMMIT;")
					await node3Connection.query("UNLOCK TABLES;")

					// update logs
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committing', movieName])
					console.log("Log updated to committing in node3")
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committed', movieName])
					console.log("Log updated to committed in node3")
					console.log("Inserted to node3")

					// end connections
					node3Connection.end()
					nodeLogsConnection.end()
				} catch (err) {
					if (node3Connection != null) {
						node3Connection.end()
					}

					if (nodeLogsConnection != null) {
						nodeLogsConnection.end()
					}

					// log to node 1 na di gumana ung node 3, may unCOMMITted sa node 3, node 1 = on, tas i query sa node 3 ung logged sa node 1
					// create log in node1 na di pumasok sa node 3 ung insert, pero successful in node 1
					// log na nag fail sa node 3
					try {
						nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
						await nodeLogsConnection.query("INSERT INTO `node1_2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('insert', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node3');")
						console.log("Successful insert in node1 but unsuccessful in node3")
					} catch(err) {
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
					


				}
			}
		}


		// false pag di na add sa node 1/node2 or 3
		if(flag2) {
			res.send(false)
		} else {
			res.send(true)
		}
		
	},

	postUpdateMovie: async (req, res) => {
		const movieName = req.body.name
		const movieYear = parseInt(req.body.year)
		const movieRank = parseFloat(req.body.rank)
		const movieId = parseInt(req.body.id)

		var flag = false
		var flag2 = false
		var node1Connection;
		var node2Connection;
		var node3Connection;
		var nodeLogsConnection

		// + logic, check what yr < 1980, and >- 1980

		if (movieYear < 1980) {
			// insert to node 1
			try {
				// throw Error // simulate
				// insert in node 1 table 1
				// connections
				node1Connection = await mysql.createConnection(config.node1conn)
				nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("START TRANSACTION;")
				await node1Connection.query("LOCK TABLES node1 write;")
		
				// insert in logs
				await nodeLogsConnection.query("INSERT INTO `node1_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node1');")
				console.log("Start log inserted to node 1 table 1")
		
				// update movie
				await node1Connection.query("UPDATE node1 SET `name` = '" + movieName + "'," + "`year` = " + movieYear + "," + "`rank` = " + movieRank + " WHERE id = " + movieId + ";")
				
				// update logs 
				await nodeLogsConnection.query("UPDATE `node1_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node1';", [movieName])
				// await nodeLogsConnection.query("UPDATE `node1_logs` SET `status` = 'write' WHERE `name` = '" + movieName + "' AND `dest` = 'node1';")
				console.log("Log updated to write in node 1 table 1")
				await node1Connection.query("COMMIT;")
				await node1Connection.query("UNLOCK TABLES;")
		
				// update logs
				await nodeLogsConnection.query('UPDATE `node1_logs` SET `status` = ? WHERE `name` = ? AND `dest` = ?;', ['committing', movieName, 'node1'])
				console.log("Log updated to committing in node 1 table 1")
				await nodeLogsConnection.query('UPDATE `node1_logs` SET `status` = ? WHERE `name` = ? AND `dest` = ?;', ['committed', movieName, 'node1'])
				console.log("Log updated to committed in node 1 table 1")
				console.log("Inserted to node 1 table 1")
		
				// end connections
				node1Connection.end()
				nodeLogsConnection.end()
		
				flag = true
		
			} catch (err) {
				console.log(err)
				if (node1Connection != null) {
					node1Connection.end()
				}
				if (nodeLogsConnection != null) {
					nodeLogsConnection.end()
				}
		
				// insert to node 2 if node 1 isn't successful
				try {
					// throw Error // simulate
					node2Connection = await mysql.createConnection(config.node2conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("START TRANSACTION;")
					await node2Connection.query("LOCK TABLES node2 write;")
		
					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node2');")
					console.log("Start log inserted to node 2")
		
					// update movie
					await node2Connection.query("UPDATE node2 SET `name` = '" + movieName + "'," + "`year` = " + movieYear + "," + "`rank` = " + movieRank + " WHERE id = " + movieId + ";")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node2';", [movieName])
					console.log("Log updated to write in node 2")
					await node2Connection.query("COMMIT;")
					await node2Connection.query("UNLOCK TABLES;")
		
					// update logs
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2';", ['committing', movieName])
					console.log("Log updated to committing in node 2")
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2';", ['committed', movieName])
					console.log("Log updated to committed in node 2")
					console.log("Inserted to node 2")
		
					// log na nag fail sa node 1
					await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node1');")
					console.log("Successful insert in node2 but unsuccessful in node1")
		
					// end connections
					node2Connection.end()
					nodeLogsConnection.end()
		
					// create log to put to node 2 na unCOMMITted ung last query, tas after, query in node 1 pag naka recover na
		
				} catch (err) {
					var flag2 = true
					console.log(err)
					if (node2Connection != null) {
						node2Connection.end()
					}
		
					if (nodeLogsConnection != null) {
						nodeLogsConnection.end()
					}
		
					// update logs status = terminated, since nag error sa lahat
					try {
						nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
						await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node2');")
						console.log("Logs in node2_logs terminated")
		
						await nodeLogsConnection.query("INSERT INTO `node1_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node1');")
						console.log("Logs in node1_logs terminated")
		
					} catch(err) {
						console.log(err)
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
		
					
				}
			}
		
			if (flag) {
				try {
					// throw Error // simulate
					node2Connection = await mysql.createConnection(config.node2conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("START TRANSACTION;")
					await node2Connection.query("LOCK TABLES node2 write;")
		
					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node2');")
					console.log("Start log inserted to node 2")
		
					// update movie
					await node2Connection.query("UPDATE node2 SET `name` = '" + movieName + "'," + "`year` = " + movieYear + "," + "`rank` = " + movieRank + " WHERE id = " + movieId + ";")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node2';", [movieName])
					console.log("Log updated to write in node 2")
					await node2Connection.query("COMMIT;")
					await node2Connection.query("UNLOCK TABLES;")
		
					// update logs
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2'", ['committing', movieName])
					console.log("Log updated to committing in node 2")
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2';", ['committed', movieName])
					console.log("Log updated to committed in node 2")
					console.log("Inserted to node 2 no error in node 1")
		
					// end connections
					node2Connection.end()
					nodeLogsConnection.end()
				} catch (err) {
					// log to node 1 na di gumana ung node 2, may unCOMMITted sa node 2, node 1 = on RECOVERY
					if (node2Connection != null) {
						node2Connection.end()
					}
		
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					// create log in node1 na di pumasok sa node 2 ung insert, pero successful in node 1
					// log na nag fail sa node 2
					try {
						
						await nodeLogsConnection.query("INSERT INTO `node1_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node2');")
						console.log("Successful insert in node1 but unsuccessful in node2")
						nodeLogsConnection.end()
					} catch(err) {
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
				}
			}
		
		
		} else if (movieYear >= 1980) {
			try {
				// throw Error // simulate
				node1Connection = await mysql.createConnection(config.node1conn)
				nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("START TRANSACTION;")
				await node1Connection.query("LOCK TABLES node1_2 write;")
		
				// insert in logs
				await nodeLogsConnection.query("INSERT INTO `node1_2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node1_2');")
				console.log("Start log inserted to node 1 table 2")
		
				// update movie
				await node1Connection.query("UPDATE node1_2 SET `name` = '" + movieName + "'," + "`year` = " + movieYear + "," + "`rank` = " + movieRank + " WHERE id = " + movieId + ";")
				
				// update logs 
				await nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node1_2';", [movieName])
				console.log("Log updated to write in node 1 table 2")
				await node1Connection.query("COMMIT;")
				await node1Connection.query("UNLOCK TABLES;")
		
				// update logs
				await nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node1_2';", ['committing', movieName])
				console.log("Log updated to committing in node 1 table 2")
				await nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node1_2';", ['committed', movieName])
				console.log("Log updated to committed in node 1 table 2")
				console.log("Inserted to node 1 table 2")
		
				// end connections
				node1Connection.end()
				nodeLogsConnection.end()
		
				flag = true
			} catch (err) {
				if (node1Connection != null) {
					node1Connection.end()
				}
		
				if (nodeLogsConnection != null) {
					nodeLogsConnection.end()
				}
		
				try {
					// throw Error // simulate
					node3Connection = await mysql.createConnection(config.node3conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("START TRANSACTION;")
					await node3Connection.query("LOCK TABLES node3 write;")
		
					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node3');")
					console.log("Start log inserted to node3")
		
					// update movie
					await node3Connection.query("UPDATE node3 SET `name` = '" + movieName + "'," + "`year` = " + movieYear + "," + "`rank` = " + movieRank + " WHERE id = " + movieId + ";")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node3';", [movieName])
					console.log("Log updated to write in node3")
					await node3Connection.query("COMMIT;")
					await node3Connection.query("UNLOCK TABLES;")
		
					// update logs
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committing', movieName])
					console.log("Log updated to committing in node3")
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committed', movieName])
					console.log("Log updated to committed in node3")
					console.log("Inserted to node3")
		
					// log na nag fail sa node 1
					await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node1_2');")
					console.log("Successful insert in node3 but unsuccessful in node1")
		
					// end connections
					node3Connection.end()
					nodeLogsConnection.end()
		
					//
				} catch (err) {
					flag2 = true
					if (node3Connection != null) {
						node3Connection.end()
					}
		
					if (nodeLogsConnection != null) {
						node3Connection.end()
					}
		
					// update logs status = terminated, since nag error sa lahat
					try {
						nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
						await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node3');")
						console.log("Logs in node3_logs terminated")
		
						await nodeLogsConnection.query("INSERT INTO `node1_2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node1');")
						console.log("Logs in node1_logs terminated")
		
					} catch(err) {
						console.log(err)
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
				}
			}
		
			if (flag) {
				// insert to node 3 if node 1 is successful
				try {
					// throw Error // simulate
					node3Connection = await mysql.createConnection(config.node3conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("START TRANSACTION;")
					await node3Connection.query("LOCK TABLES node3 write;")
		
					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node3');")
					console.log("Start log inserted to node3")
		
					// update movie
					await node3Connection.query("UPDATE node3 SET `name` = '" + movieName + "'," + "`year` = " + movieYear + "," + "`rank` = " + movieRank + " WHERE id = " + movieId + ";")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node3';", [movieName])
					console.log("Log updated to write in node3")
					await node3Connection.query("COMMIT;")
					await node3Connection.query("UNLOCK TABLES;")
		
					// update logs
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committing', movieName])
					console.log("Log updated to committing in node3")
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committed', movieName])
					console.log("Log updated to committed in node3")
					console.log("Inserted to node3")
		
					// end connections
					node3Connection.end()
					nodeLogsConnection.end()
				} catch (err) {
					if (node3Connection != null) {
						node3Connection.end()
					}
		
					if (nodeLogsConnection != null) {
						nodeLogsConnection.end()
					}
		
					// log to node 1 na di gumana ung node 3, may unCOMMITted sa node 3, node 1 = on, tas i query sa node 3 ung logged sa node 1
					// create log in node1 na di pumasok sa node 3 ung insert, pero successful in node 1
					// log na nag fail sa node 3
					try {
						nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
						await nodeLogsConnection.query("INSERT INTO `node1_2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('update', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node3');")
						console.log("Successful insert in node1 but unsuccessful in node3")
					} catch(err) {
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
					
		
		
				}
			}
		}
		
		
		// false pag di na add sa node 1/node2 or 3
		if(flag2) {
			res.send(false)
		} else {
			res.send(true)
		}
	},

	postDeleteMovie: async (req, res) => {
		const movieId = parseInt(req.body.id)
		const movieYear = parseInt(req.body.year)
		const movieName = req.body.name
		const movieRank = req.body.rank
		var flag = false
		var flag2 = false
		var node1Connection
		var node2Connection
		var node3Connection
		var nodeLogsConnection

		// delete from node 1
		if (movieYear < 1980) {
			// insert to node 1
			try {
				// throw Error // simulate
				// insert in node 1 table 1
				// connections
				node1Connection = await mysql.createConnection(config.node1conn)
				nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("START TRANSACTION;")
				await node1Connection.query("LOCK TABLES node1 write;")
		
				// insert in logs
				await nodeLogsConnection.query("INSERT INTO `node1_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node1');")
				console.log("Start log inserted to node 1 table 1")
		
				// delete movie
				await node1Connection.query("DELETE FROM node1 WHERE id = " + movieId + ";")
				
				// update logs 
				await nodeLogsConnection.query("UPDATE `node1_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node1';", [movieName])
				// await nodeLogsConnection.query("UPDATE `node1_logs` SET `status` = 'write' WHERE `name` = '" + movieName + "' AND `dest` = 'node1';")
				console.log("Log updated to write in node 1 table 1")
				await node1Connection.query("COMMIT;")
				await node1Connection.query("UNLOCK TABLES;")
		
				// update logs
				await nodeLogsConnection.query('UPDATE `node1_logs` SET `status` = ? WHERE `name` = ? AND `dest` = ?;', ['committing', movieName, 'node1'])
				console.log("Log updated to committing in node 1 table 1")
				await nodeLogsConnection.query('UPDATE `node1_logs` SET `status` = ? WHERE `name` = ? AND `dest` = ?;', ['committed', movieName, 'node1'])
				console.log("Log updated to committed in node 1 table 1")
				console.log("Inserted to node 1 table 1")
		
				// end connections
				node1Connection.end()
				nodeLogsConnection.end()
		
				flag = true
		
			} catch (err) {
				console.log(err)
				if (node1Connection != null) {
					node1Connection.end()
				}
				if (nodeLogsConnection != null) {
					nodeLogsConnection.end()
				}
		
				// insert to node 2 if node 1 isn't successful
				try {
					// throw Error // simulate
					node2Connection = await mysql.createConnection(config.node2conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("START TRANSACTION;")
					await node2Connection.query("LOCK TABLES node2 write;")
		
					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node2');")
					console.log("Start log inserted to node 2")
		
					// delete movie
					await node2Connection.query("DELETE FROM node2 WHERE id = " + movieId + ";")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node2';", [movieName])
					console.log("Log updated to write in node 2")
					await node2Connection.query("COMMIT;")
					await node2Connection.query("UNLOCK TABLES;")
		
					// update logs
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2';", ['committing', movieName])
					console.log("Log updated to committing in node 2")
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2';", ['committed', movieName])
					console.log("Log updated to committed in node 2")
					console.log("Inserted to node 2")
		
					// log na nag fail sa node 1
					await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node1');")
					console.log("Successful insert in node2 but unsuccessful in node1")
		
					// end connections
					node2Connection.end()
					nodeLogsConnection.end()
		
					// create log to put to node 2 na unCOMMITted ung last query, tas after, query in node 1 pag naka recover na
		
				} catch (err) {
					var flag2 = true
					console.log(err)
					if (node2Connection != null) {
						node2Connection.end()
					}
		
					if (nodeLogsConnection != null) {
						nodeLogsConnection.end()
					}
		
					// update logs status = terminated, since nag error sa lahat
					try {
						nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
						await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node2');")
						console.log("Logs in node2_logs terminated")
		
						await nodeLogsConnection.query("INSERT INTO `node1_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node1');")
						console.log("Logs in node1_logs terminated")
		
					} catch(err) {
						console.log(err)
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
		
					
				}
			}
		
			if (flag) {
				try {
					// throw Error // simulate
					node2Connection = await mysql.createConnection(config.node2conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					await node2Connection.query("set autocommit = 0;")
					await node2Connection.query("START TRANSACTION;")
					await node2Connection.query("LOCK TABLES node2 write;")
		
					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node2');")
					console.log("Start log inserted to node 2")
		
					// delete movie
					await node2Connection.query("DELETE FROM node2 WHERE id = " + movieId + ";")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node2';", [movieName])
					console.log("Log updated to write in node 2")
					await node2Connection.query("COMMIT;")
					await node2Connection.query("UNLOCK TABLES;")
		
					// update logs
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2'", ['committing', movieName])
					console.log("Log updated to committing in node 2")
					await nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node2';", ['committed', movieName])
					console.log("Log updated to committed in node 2")
					console.log("Inserted to node 2 no error in node 1")
		
					// end connections
					node2Connection.end()
					nodeLogsConnection.end()
				} catch (err) {
					// log to node 1 na di gumana ung node 2, may unCOMMITted sa node 2, node 1 = on RECOVERY
					if (node2Connection != null) {
						node2Connection.end()
					}
		
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					// create log in node1 na di pumasok sa node 2 ung insert, pero successful in node 1
					// log na nag fail sa node 2
					try {
						
						await nodeLogsConnection.query("INSERT INTO `node1_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node2');")
						console.log("Successful insert in node1 but unsuccessful in node2")
						nodeLogsConnection.end()
					} catch(err) {
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
				}
			}
		
		
		} else if (movieYear >= 1980) {
			try {
				// throw Error // simulate
				node1Connection = await mysql.createConnection(config.node1conn)
				nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
				await node1Connection.query("set autocommit = 0;")
				await node1Connection.query("START TRANSACTION;")
				await node1Connection.query("LOCK TABLES node1_2 write;")
		
				// insert in logs
				await nodeLogsConnection.query("INSERT INTO `node1_2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node1_2');")
				console.log("Start log inserted to node 1 table 2")
		
				// delete movie
				await node1Connection.query("DELETE FROM node1_2 WHERE id = " + movieId + ";")
				
				// update logs 
				await nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node1_2';", [movieName])
				console.log("Log updated to write in node 1 table 2")
				await node1Connection.query("COMMIT;")
				await node1Connection.query("UNLOCK TABLES;")
		
				// update logs
				await nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node1_2';", ['committing', movieName])
				console.log("Log updated to committing in node 1 table 2")
				await nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node1_2';", ['committed', movieName])
				console.log("Log updated to committed in node 1 table 2")
				console.log("Inserted to node 1 table 2")
		
				// end connections
				node1Connection.end()
				nodeLogsConnection.end()
		
				flag = true
			} catch (err) {
				if (node1Connection != null) {
					node1Connection.end()
				}
		
				if (nodeLogsConnection != null) {
					nodeLogsConnection.end()
				}
		
				try {
					// throw Error // simulate
					node3Connection = await mysql.createConnection(config.node3conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("START TRANSACTION;")
					await node3Connection.query("LOCK TABLES node3 write;")
		
					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node3');")
					console.log("Start log inserted to node3")
		
					// delete movie
					await node3Connection.query("DELETE FROM node3 WHERE id = " + movieId + ";")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node3';", [movieName])
					console.log("Log updated to write in node3")
					await node3Connection.query("COMMIT;")
					await node3Connection.query("UNLOCK TABLES;")
		
					// update logs
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committing', movieName])
					console.log("Log updated to committing in node3")
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committed', movieName])
					console.log("Log updated to committed in node3")
					console.log("Inserted to node3")
		
					// log na nag fail sa node 1
					await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node1_2');")
					console.log("Successful insert in node3 but unsuccessful in node1")
		
					// end connections
					node3Connection.end()
					nodeLogsConnection.end()
		
					//
				} catch (err) {
					flag2 = true
					if (node3Connection != null) {
						node3Connection.end()
					}
		
					if (nodeLogsConnection != null) {
						node3Connection.end()
					}
		
					// update logs status = terminated, since nag error sa lahat
					try {
						nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
						await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node3');")
						console.log("Logs in node3_logs terminated")
		
						await nodeLogsConnection.query("INSERT INTO `node1_2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'terminated', 'node1');")
						console.log("Logs in node1_logs terminated")
		
					} catch(err) {
						console.log(err)
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
				}
			}
		
			if (flag) {
				// insert to node 3 if node 1 is successful
				try {
					// throw Error // simulate
					node3Connection = await mysql.createConnection(config.node3conn)
					nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
		
					await node3Connection.query("set autocommit = 0;")
					await node3Connection.query("START TRANSACTION;")
					await node3Connection.query("LOCK TABLES node3 write;")
		
					// insert in logs
					await nodeLogsConnection.query("INSERT INTO `node3_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'start', 'node3');")
					console.log("Start log inserted to node3")
		
					// delete movie
					await node3Connection.query("DELETE FROM node3 WHERE id = " + movieId + ";")
					
					// update logs 
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = 'write' WHERE `name` = ? AND `dest` = 'node3';", [movieName])
					console.log("Log updated to write in node3")
					await node3Connection.query("COMMIT;")
					await node3Connection.query("UNLOCK TABLES;")
		
					// update logs
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committing', movieName])
					console.log("Log updated to committing in node3")
					await nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ? AND `dest` = 'node3';", ['committed', movieName])
					console.log("Log updated to committed in node3")
					console.log("Inserted to node3")
		
					// end connections
					node3Connection.end()
					nodeLogsConnection.end()
				} catch (err) {
					if (node3Connection != null) {
						node3Connection.end()
					}
		
					if (nodeLogsConnection != null) {
						nodeLogsConnection.end()
					}
		
					// log to node 1 na di gumana ung node 3, may unCOMMITted sa node 3, node 1 = on, tas i query sa node 3 ung logged sa node 1
					// create log in node1 na di pumasok sa node 3 ung insert, pero successful in node 1
					// log na nag fail sa node 3
					try {
						nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
						await nodeLogsConnection.query("INSERT INTO `node1_2_logs` (`operation`, `name`, `year`, `rank`, `status`, `dest`) VALUES ('delete', '" + movieName + "'," + movieYear + "," + movieRank + ", 'committing', 'node3');")
						console.log("Successful insert in node1 but unsuccessful in node3")
					} catch(err) {
						if(nodeLogsConnection != null) {
							nodeLogsConnection.end()
						}
					}
					
		
		
				}
			}
		}
		
		
		// false pag di na add sa node 1/node2 or 3
		if(flag2) {
			res.send(false)
		} else {
			res.send(true)
		}

	},

	getError500: (req, res) => {
		const data = {
			title: "Error",
			styles: ["sidebar"],
			scripts: ["sidebar", "movies-datatable", "admin-product-modal"]
		}

		res.render('error-500', data)
	},

	getRecovery: (req, res) => {
		const data = {
			title: "Node Recovery",
			styles: ["sidebar"],
			scripts: ["sidebar", "movies-datatable", "admin-product-modal", "recovery"]
		}

		res.render('recovery', data)
	},

	postRecovery: async (req, res) => {
		// find status na may committing
		// find kung saang destination, tas write dun
		var node1Connection
		var node2Connection
		var node3Connection
		var nodeLogsConnection
		var flag = true

		try {
			// RECOVER NODE 1
			// check node 2 
			nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
			const [rows1, fields1] = await nodeLogsConnection.query("SELECT * FROM `node2_logs` WHERE `status` = ? AND `dest` = ?;", ['committing', 'node1'])

			// put in node 1 table 1
			node1Connection = await mysql.createConnection(config.node1conn)
			node2Connection = await mysql.createConnection(config.node2conn)
			node3Connection = await mysql.createConnection(config.node3conn)

			rows1.forEach(e => {
				if(e.operation == "insert") {
					node1Connection.query("INSERT INTO `node1` (`name`, `year`, `rank`) VALUES (?, ?, ?);", [e.name, e.year, e.rank])
					nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])

					console.log("[RECOVERY] INSERTED IN NODE 1 TABLE 1")
				} else if (e.operation == "update") {
					node1Connection.query("UPDATE `node1` SET `rank` = ? WHERE `name` = ?;", [e.rank, e.name])
					nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])
					node2Connection.query("UPDATE `node2` SET `rank` = ? WHERE `name` = ?;", [e.rank, e.name])
					
					console.log("[RECOVERY] UPDATED IN NODE 1 TABLE 1")
				} else if(e.operation == "delete") {
					node1Connection.query("DELETE FROM `node1` WHERE `name` = ?;", [e.name])
					nodeLogsConnection.query("UPDATE `node2_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])
					node2Connection.query("DELETE FROM `node2` WHERE `name` = ?;", [e.name])

					console.log("[RECOVERY] DELETED IN NODE 1 TABLE 1")
				}
			})

			// check node 3
			const [rows2, fields2] = await nodeLogsConnection.query("SELECT * FROM `node3_logs` WHERE `status` = ? AND `dest` = ?;", ['committing', 'node1_2'])

			// put in node 1 table 2
			rows2.forEach(e => {
				if(e.operation == "insert") {
					node1Connection.query("INSERT INTO `node1_2` (`name`, `year`, `rank`) VALUES (?, ?, ?);", [e.name, e.year, e.rank])
					nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])

					console.log("[RECOVERY] INSERTED IN NODE 1 TABLE 2")
				} else if (e.operation == "update") {
					node1Connection.query("UPDATE `node1_2` SET `rank` = ? WHERE `name` = ?;", [e.rank, e.name])
					nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])
					node3Connection.query("UPDATE `node3` SET `rank` = ? WHERE `name` = ?;", [e.rank, e.name])

					console.log("[RECOVERY] UPDATED IN NODE 1 TABLE 2")
				} else if(e.operation == "delete") {
					node1Connection.query("DELETE FROM `node1_2` WHERE `name` = ?;", [e.name])
					nodeLogsConnection.query("UPDATE `node3_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])
					node3Connection.query("DELETE FROM `node3` WHERE `name` = ?;", [e.name])

					console.log("[RECOVERY] DELETED IN NODE 1 TABLE 2")
				}
			})
		} catch(err) {
			if(node1Connection != null) {
				node1Connection.end()
			}

			if(nodeLogsConnection != null) {
				nodeLogsConnection.end()
			}

			if(node2Connection != null) {
				node2Connection.end()
			}

			if(node3Connection != null) {
				node3Connection.end()
			}

			console.log(err)

			flag = false
		}


		// RECOVER NODE 2
		try {
			// check node 1 table 1 logs
			nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
			const [rows3, fields3] = await nodeLogsConnection.query("SELECT * FROM `node1_logs` WHERE `status` = ? AND `dest` = ?;", ['committing', 'node2'])

			node1Connection = await mysql.createConnection(config.node1conn)
			node2Connection = await mysql.createConnection(config.node2conn)

			rows3.forEach(e => {
				if(e.operation == "insert") {
					node2Connection.query("INSERT INTO `node2` (`name`, `year`, `rank`) VALUES (?, ?, ?);", [e.name, e.year, e.rank])
					nodeLogsConnection.query("UPDATE `node1_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])

					console.log("[RECOVERY] INSERTED IN NODE 2")
				} else if (e.operation == "update") {
					node2Connection.query("UPDATE `node2` SET `rank` = ? WHERE `name` = ?;", [e.rank, e.name])
					nodeLogsConnection.query("UPDATE `node1_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])
					node1Connection.query("UPDATE `node1` SET `rank` = ? WHERE `name` = ?;", [e.rank, e.name])

					console.log("[RECOVERY] UPDATED IN NODE 2")
				} else if(e.operation == "delete") {
					node2Connection.query("DELETE FROM `node2` WHERE `name` = ?;", [e.name])
					nodeLogsConnection.query("UPDATE `node1_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])
					node1Connection.query("DELETE FROM `node1` WHERE `name` = ?;", [e.name])

					console.log("[RECOVERY] DELETED IN NODE 2")
				}
			})

		} catch(err) {
			if(node1Connection != null) {
				node1Connection.end()
			}

			if(nodeLogsConnection != null) {
				nodeLogsConnection.end()
			}

			if(node2Connection != null) {
				node2Connection.end()
			}
			console.log(err)

			flag = false
		}

		// RECOVER NODE 3
		try {
			// check node 1 table 2 logs
			nodeLogsConnection = await mysql.createConnection(config.nodeLogsConn)
			const [rows4, fields3] = await nodeLogsConnection.query("SELECT * FROM `node1_logs` WHERE `status` = ? AND `dest` = ?;", ['committing', 'node2'])

			node1Connection = await mysql.createConnection(config.node1conn)
			node3Connection = await mysql.createConnection(config.node3conn)

			rows4.forEach(e => {
				if(e.operation == "insert") {
					node3Connection.query("INSERT INTO `node3` (`name`, `year`, `rank`) VALUES (?, ?, ?);", [e.name, e.year, e.rank])
					nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])

					console.log("[RECOVERY] INSERTED IN NODE 3")
				} else if (e.operation == "update") {
					node3Connection.query("UPDATE `node3` SET `rank` = ? WHERE `name` = ?;", [e.rank, e.name])
					nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])
					node1Connection.query("UPDATE `node1_2` SET `rank` = ? WHERE `name` = ?;", [e.rank, e.name])

					console.log("[RECOVERY] UPDATED IN NODE 3")
				} else if(e.operation == "delete") {
					node3Connection.query("DELETE FROM `node3` WHERE `name` = ?;", [e.name])
					nodeLogsConnection.query("UPDATE `node1_2_logs` SET `status` = ? WHERE `name` = ?;", ['committed', e.name])
					node1Connection.query("DELETE FROM `node1_2` WHERE `name` = ?;", [e.name])

					console.log("[RECOVERY] DELETED IN NODE 3")
				}
			})

		} catch(err) {
			if(node1Connection != null) {
				node1Connection.end()
			}

			if(nodeLogsConnection != null) {
				nodeLogsConnection.end()
			}

			if(node3Connection != null) {
				node3Connection.end()
			}
			console.log(err)

			flag = false
		}

		if(flag) {
			res.send(true)
		} else if(!flag) {
			res.send(false)
		}
	}


}

module.exports = controller