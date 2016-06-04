'use strict';

var express = require('express');
var app = express();
var port = process.env.PORT || 8000;
var WooCommerceAPI = require('woocommerce-api');
var configUrl = process.env.URL || require('../config').url;
var configConsumerKey = process.env.CONSUMERKEY || require('../config').consumerKey;
var configConsumerSecret = process.env.CONSUMERSECRET || require('../config').consumerSecret;

var WooCommerce = new WooCommerceAPI({
  url: configUrl,
  consumerKey: configConsumerKey,
  consumerSecret: configConsumerSecret
});

/**
 * Products API
 */
app.get('/api/products', function (req, res) {
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
