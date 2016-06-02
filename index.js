'use strict';

var express = require('express');
var cors = require('cors');
var app = express();
var port = process.env.PORT || 3001;
var WooCommerceAPI = require('woocommerce-api');
var configUrl = process.env.URL;
var configConsumerKey = process.env.CONSUMERKEY;
var configConsumerSecret = process.env.CONSUMERSECRET;

var whitelist = ['http://dev.repsparta.com', 'http://repsparta.com', 'https://repsparta.com'];
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

app.get('/hello', function(req, res) {
    console.log(configUrl)
console.log(configConsumerKey)
    res.send('YYYYYYoooooooo!');
})

/**
 * Products API
 */
app.get('/products', cors(corsOptions), function (req, res) {
  WooCommerce.get('products', function (err, data, response) {
    console.log('data', data)
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
app.post('/api/order', function (req, res) {
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

