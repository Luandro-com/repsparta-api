const router = require('express').Router();
const WooCommerce = require('../../woocommerce');

/**
 * Orders API
 */
router.post('/', (req, res) => {
  console.log("Acessing /order POST", req.body);
  const data = req.body;
  WooCommerce.post('orders', data, (error, data, wooRes) => {
    const formatedWoo = JSON.parse(wooRes);
    if (formatedWoo.order) {
      res.send({
        ok: true,
        order_number: formatedWoo.order.order_number,
        order_key: formatedWoo.order.order_key
      });
    } else {
      res.send({
        ok: false
      });
    }
  });
});

/**
 * Post Order Notes API
 */
router.post('/notes', (req, res) => {
 const data = req.body;
 console.log("Acessing /orders/notes POST", data);
 WooCommerce.post(`orders/${data.id}/notes`, data.notes, (error, data, wooRes) => {
   const formatedWoo = JSON.parse(wooRes);
   console.log(formatedWoo);
   if(formatedWoo.order) {
     res.send({
       ok: true,
       order_number: formatedWoo.order.order_number,
       order_key: formatedWoo.order.order_key
     })
   } else {
     res.send({
       ok: false
     })
   }

  });
});

module.exports = router;
