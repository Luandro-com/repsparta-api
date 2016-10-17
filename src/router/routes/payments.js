const router = require('express').Router();
const WooCommerce = require('../../woocommerce.js');
const pag = require('../../pagseguro.js');
const XMLparser = require('xml2json');

/**
 * Payment
 */
router.post('/', (req, res) => {
   console.log('acessing /payment POST');
   const data = req.body;
   console.log(data);
   pag.reference(data.ref);
   pag.currency('BRL');

   data.cart.map((item) => {
     pag.addItem({
         id: item.id,
         description: item.name,
         amount: item.price+'.00',
         quantity: item.quantity,
         weight: ''
     });
   });
   pag.setRedirectURL("http://repsparta.com/success");
   pag.setNotificationURL("https://repsparta-api.luandro.com/api/pag_payment_success");
   pag.buyer({
       name: data.full_name,
       email: data.email,
       country: 'BRA'
   });
   pag.send((err, payRes) => {
     if (err) {
       console.log(err);
     }
     const formatedData = XMLparser.toJson(payRes, {object: true});
     console.log('Payment response', formatedData);
     console.log('========================== END OF PAYMENT ====================');
     if(formatedData.checkout) {
       res.status(200).json({
         ok: true,
         code: formatedData.checkout.code
       });
     } else {
       res.status(404).json({
         ok: false
       })
     }
   });
});

/**
 * Payment Sucess from PagSeguro
 */
router.post('/success', (req, res) => {
  console.log('acessing /payments/success POST');
  console.log(req.body);
  request(`https://ws.pagseguro.uol.com.br/v2/transactions/notifications/${req.body.notificationCode}?email=${configEmail}&token=${configToken}`,
  (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const formatedData = XMLparser.toJson(body, {object: true});
      console.log(formatedData);
      const pagData = formatedData.transaction;
      let status, paid = false;
      switch(pagData.status) {
        case 1:
         status = 'pending';
        case 2:
         status = 'processing';
        case 3:
         status = 'completed';
         paid = true;
       case 4:
         status = 'completed';
       case 5:
         status = 'on-hold';
       case 6:
         status = 'refunded';
       case 7:
         status = 'failed';
        default:
         status = 'pending';
      }
      var data = {
        order: {
          status: status,
          payment_details: {
            method_id: 'pagseguro',
            method_title: 'PagSeguro',
            paid: paid
          },
          transaction_id: pagData.code
        }
      };
      WooCommerce.put(`orders/${pagData.reference}`, data, function(err, data, wooRes) {
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
    }
 })
});


/**
 * Payment Sucess from Store
 */
 router.put('/success', (req, res) => {
   console.log('acessing /payments/success PUT');
   const data = {
     order: {
       status: 'completed',
       payment_details: {
         method_id: 'pagseguro',
         method_title: 'PagSeguro',
         paid: true
       },
       transaction_id: req.body.transactionCode
     }
   };

   WooCommerce.put(`orders/${req.body.orderId}`, data, (err, data, wooRes) => {
     const formatedWoo = JSON.parse(wooRes);
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
