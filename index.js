'use strict';

var express = require('express');
var cors = require('cors');
var app = express();
var port = process.env.PORT || 3001;
var WooCommerceAPI = require('woocommerce-api');
var pagseguro = require('pagseguro');
var XMLparser = require('xml2json');
var uuid = require('node-uuid').v4;


var configUrl = process.env.URL;
var configConsumerKey = process.env.CONSUMERKEY;
var configConsumerSecret = process.env.CONSUMERSECRET;
var configToken = process.env.TOKEN;
var configEmail = process.env.EMAIL;

var whitelist = [
  'http://alpha.repsparta.com',
  'http://beta.repsparta.com',
  'http://repsparta.com',
  'https://repsparta.com',
  'http://locahost:300',
  'http://dev.repsparta.com'
];

var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};

var WooCommerce = new WooCommerceAPI({
  url: configUrl,
  consumerKey: configConsumerKey,
  consumerSecret: configConsumerSecret
});

var pag = new pagseguro({
  email : configEmail,
  token: configToken,
  mode : 'sandbox'
});

/**
 * Hello
*/
app.get('/hello', function(req, res) {
    console.log(configUrl)
console.log(configConsumerKey)
    res.send('YYYYYYoooooooo!');
});
/**
 * Payment
 */
 app.post('/api/payment', cors(corsOptions), (req, res) => {
   console.log('acessing /payment POST');
   console.log(req.body);
   const data = req.body.order;
   data.line_items.map((item) => {
     pag.addItem({
         id: item.id,
         description: item.name,
         amount: item.price+'.00',
         quantity: item.quantity,
         weight: ''
     });
   });
   pag.currency('BRL');
   pag.setRedirectURL("http://loja.repsparta.com");
   pag.setNotificationURL("http://loja.repsparta.com/shop");
   pag.reference(uuid());
   pag.buyer({
       name: data.billing_address.first_name,
       email: data.billing_address.email,
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
app.get('/api/products', cors(corsOptions), function (req, res) {
  console.log("Acessing /products");
  WooCommerce.get('products', function (err, data, response) {
    if (data.statusCode === 200) {
      var formatedData = JSON.parse(response);
      res.status(200).json(formatedData);
    } else {
      res.status(data.statusCode).send(response);
    }
  });
});
/**
 * Orders API
 */
app.post('/api/order', cors(corsOptions), function (req, res) {
  console.log("Acessing /order POST", req.body);
  var data = req.body;
  WooCommerce.post('orders', data, function (error, data, wooRes) {
    var formatedWoo = JSON.parse(wooRes);
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

app.listen(port, function (err) {
  if (err) {
    console.log("ERROR: ", err);
  }
  console.log("Listening of port", port);
});

