const { getFromNode2 } = require('../db');
const db = require('../db');

const controller = {

	getHome: (req,res) =>{
		const data = {
			title: "Home",
		}

		let n1Name = "node1"
		let n1Name2 = "node1_2"
		let n2Name = "node2"
		let n3Name = "node3"
		let dataDB1 = []
		let dataDB2 = []

		let part1N1 = "SELECT * FROM " + n1Name + " LIMIT 20"
		let part2N1 = "SELECT * FROM " + n1Name2 + " LIMIT 20"

		db.getFromNode1(part1N1, function(result) {
			// check ung nabalik
			if(result[1] == null) {
				dataDB1.push(result)
				data.dataDB1 = dataDB1

				console.log(dataDB1)
				console.log('----------------------------------------------------------------------------------------')

				db.getFromNode1(part2N1, function(result) {

					if(result[1] == null) {
						dataDB2.push(result)

						data.dataDB2 = dataDB2
						console.log(dataDB2)
						res.render('movies', data)
					}
				})
			} else {
				
			}
		})
	},

	getMovies: (req, res) => {
		const data = {
			title: "Movies",
			styles: ["sidebar"],
			scripts: ["sidebar"]
		}

		let dataDB = []

		let query = "SELECT * FROM node2;"

		db.getFromDB(query, function(result) {
			dataDB = result

			data.dataDB = dataDB

			res.render('movies', data)
		})
	}
}

module.exports = controller
