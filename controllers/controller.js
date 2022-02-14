

const controller = {
  /**
   * This function renders the home page
   * @param req - the incoming request containing either the query or body
   * @param res - the result to be sent out after processing the request
   */
  getHome: (req, res) => {
    res.render('home')
  }
}

module.exports = controller
