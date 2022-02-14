

const controller = {

  getHome: (req,res) =>{
    const data = {
      styles: ['style', 'sidebar'],
      scripts: ['admin-product-data-table', 'sidebar', 'admin-toast','admin-product-modal'],
      title: "Products Page"
    }

    res.render('home',data);
    

    if (db.getAuth.currentUser != null) {
      const email = db.getAuth.currentUser.email
      db.getAll('Admin', function (adminresult) {
        let flag = false
        if (adminresult !== null) {
          let i = 0
          while (!flag && (i < adminresult.length)) {
            if (email === adminresult[i].customerEmail) {
              flag = true
            }
            i++
          }
          if (flag) {
            db.getAll('Products', function (result) {
              let products = []
              result.forEach((element) => {
                let item = {
                  productName: element.productName,
                  productImages: element.productImages[0],
                  productCategory: element.productCategory,
                  productPrice: element.productPrice,
                  productStock: element.productStock,
                  productDesc: element.productDesc,
                  productBrand: element.productBrand,
                  productId: element.productId,
                  productDiscounted: element.productDiscounted,
                  productDisprice: element.productDisprice
                };
                products.push(item)
              })
              data.products = products;
              res.render('home',data);
            });
          } else {
            res.redirect('/error');
          }
        }
      })
    } else {
      res.redirect('/error')
    }
  },
}

module.exports = controller
