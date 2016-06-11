'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;
const WooCommerceAPI = require('woocommerce-api');
const uuid = require('node-uuid').v4;
const pagseguro = require('pagseguro');
const XMLparser = require('xml2json');
const request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const configUrl = process.env.URL || require('./config').adminUrl;
const configConsumerKey = process.env.CONSUMERKEY || require('./config').consumerKey;
const configConsumerSecret = process.env.CONSUMERSECRET || require('./config').consumerSecret;
const configToken = process.env.TOKEN || require('./config').token;
const configEmail = process.env.EMAIL || require('./config').email;

const whitelist = [
  'http://beta.repsparta.com',
  'http://repsparta.com',
  'https://repsparta.com',
  'https://pagseguro.uol.com.br',
  'http://localhost:3000'
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

/**
 * Hello
*/
app.get('/api/hello', (req, res) => {
    console.log(configUrl);
    console.log(configConsumerKey);
    res.send('YYYYYYoooooooo! Welcome to Spartas API');
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
  //  var data = {
  //    order: {
  //      status: 'completed',
  //      payment_details: {
  //        method_id: 'pagseguro',
  //        method_title: 'PagSeguro',
  //        paid: true
  //      },
  //      transaction_id: req.body.transaction
  //    }
  //  };
   console.log(req.body);
   request(`https://ws.pagseguro.uol.com.br/v2/transactions/notifications/${req.body.notificationCode}?email=${configEmail}&token=${configToken}`,
   (error, response, body) => {
     if (!error && response.statusCode == 200) {
       console.log(body)
     }
  })

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
  const pag = new pagseguro({
      email : configEmail,
      token: configToken,
      // mode : 'sandbox'
   });
   console.log('acessing /payment POST');
   const data = req.body;
   console.log(data);
   pag.reference(data.ref);
   pag.currency('BRL');

   data.cart.map((item) => {
     console.log('Adding...', item);
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
 app.post('/api/order_notes', cors(corsOptions), (req, res) => {
   const data = req.body;
   console.log("Acessing /order_notes POST", data);
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
