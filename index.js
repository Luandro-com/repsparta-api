'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;
const WooCommerceAPI = require('woocommerce-api');
const pagseguro = require('pagseguro');
const XMLparser = require('xml2json');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const configUrl = process.env.URL || require('./config').adminUrl;
const configConsumerKey = process.env.CONSUMERKEY || require('./config').consumerKey;
const configConsumerSecret = process.env.CONSUMERSECRET || require('./config').consumerSecret;
const configToken = process.env.TOKEN || require('./config').token;
const configEmail = process.env.EMAIL || require('./config').email;

const whitelist = [
  'http://alpha.repsparta.com',
  'http://beta.repsparta.com',
  'http://repsparta.com',
  'https://repsparta.com',
  'http://dev.repsparta.com',
  'https://pagseguro.uol.com.br'
];

const corsOptions = {
  origin: function(origin, callback){
    const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};

const WooCommerce = new WooCommerceAPI({
  url: configUrl,
  consumerKey: configConsumerKey,
  consumerSecret: configConsumerSecret
});

const pag = new pagseguro({
  email : configEmail,
  token: configToken,
  mode : 'sandbox'
});

/**
 * Hello
*/
app.get('/hello', (req, res) => {
    console.log(configUrl);
    console.log(configConsumerKey);
    res.send('YYYYYYoooooooo!');
});
/**
 * Payment Sucess from Store
 */
 app.options('/api/payment_success', cors(corsOptions));
 app.post('/api/payment_success', cors(corsOptions), (req, res) => {
   console.log('acessing /payment_success POST');
   var data = {
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

   WooCommerce.put(`orders/${req.body.orderId}`, data, function(err, data, wooRes) {
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
 /**
  * Payment Sucess from PagSeguro
  */
 app.options('/api/pag_payment_success', cors(corsOptions));
 app.post('/api/pag_payment_success', cors(corsOptions), (req, res) => {
   console.log('acessing /pag_payment_success POST');
   var data = {
     order: {
       status: 'completed',
       payment_details: {
         method_id: 'pagseguro',
         method_title: 'PagSeguro',
         paid: true
       },
       transaction_id: req.body.transaction
     }
   };
   console.log(req.body);
  //  WooCommerce.put(`orders/${req.body.orderId}`, data, function(err, data, wooRes) {
  //    const formatedWoo = JSON.parse(wooRes);
  //    if(formatedWoo.order) {
  //      res.send({
  //        ok: true,
  //        order_number: formatedWoo.order.order_number,
  //        order_key: formatedWoo.order.order_key
  //      })
  //    } else {
  //      res.send({
  //        ok: false
  //      })
  //    }
  //  });;
});
/**
 * Payment
 */
app.options('/api/payment', cors(corsOptions));
app.post('/api/payment', cors(corsOptions), (req, res) => {
   console.log('acessing /payment POST');
   const data = req.body;
   data.cart.map((item) => {
     pag.addItem({
         id: item.id,
         description: item.name,
         amount: item.price+'.00',
         quantity: item.quantity,
         weight: ''
     });
   });
   pag.currency('BRL');
   pag.setRedirectURL("http://beta.repsparta.com/success");
   pag.setNotificationURL("https://repsparta-api.luandro.com/api/pag_payment_success");
   pag.reference(data.ref);
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
 * Products API
 */
app.get('/api/products', cors(corsOptions), (req, res) => {
  console.log("Acessing /products");
  WooCommerce.get('products', (err, data, response) => {
    if (data.statusCode === 200) {
      const formatedData = JSON.parse(response);
      res.status(200).json(formatedData);
    } else {
      res.status(data.statusCode).send(response);
    }
  });
});
/**
 * Orders API
 */
app.options('/api/order', cors(corsOptions));
app.post('/api/order', cors(corsOptions), (req, res) => {
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

app.listen(port, (err) => {
  if (err) {
    console.log("ERROR: ", err);
  }
  console.log("Listening of port", port);
});
/**
 * Post Order Notes API
 */
 app.options('/api/order_notes', cors(corsOptions));
 app.post('/api/order_notes', (req, res) => {
   const data = req.body;
   console.log("Acessing /order_notes POST", req.body);
   WooCommerce.post(`orders/${data.id}/notes`, data.note, (error, data, wooRes) => {
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
