const db = require('../database');

const controller = {

	getHome: (req,res) =>{
		const data = {
			title: "Products Page"
		}

		let dataDB = []

		let query = "SELECT * FROM node2 WHERE year = 1971"

		db.getAll(query, function(result) {
			dataDB = result
			// console.log(dataDB)

			data.dataDB = dataDB

			res.render('home', data)
		})
	},
}

module.exports = controller
