const router = require('express').Router();
const WooCommerce = require('../../woocommerce.js');

 /**
  * Products API
  */
router.get('/', (req, res) => {
 console.log("Acessing /products");
 WooCommerce.get('products', (err, data, response) => {
   if (data && data.statusCode === 200) {
     const formatedData = JSON.parse(response);
     res.status(200).json(formatedData);
   } else if (data) {
     res.status(data.statusCode).send(response);
   } else {
     res.status(501).send(response)
   }
 });
});

module.exports = router;
