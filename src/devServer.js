import express from 'express';

const app = express();
const port = process.env.PORT || 8000;
const WooCommerceAPI = require('woocommerce-api');
const configUrl = process.env.URL || require('../config').url;
const configConsumerKey = process.env.CONSUMERKEY || require('../config').consumerKey;
const configConsumerSecret = process.env.CONSUMERSECRET || require('../config').consumerSecret;

const WooCommerce = new WooCommerceAPI({
  url: configUrl,
  consumerKey: configConsumerKey,
  consumerSecret: configConsumerSecret,
});

/**
 * Products API
 */
app.get('/api/products', (req, res) => {
  WooCommerce.get('products', (err, data, response) => {
    if(data.statusCode === 200) {
      const formatedData = JSON.parse(response)
      res.status(200).json(formatedData);
    } else {
      res.status(data.statusCode).send(response);
    }
  })
});
/**
 * Orders API
 */
app.post('/api/order', (req, res) => {
  const data = req.body;
  WooCommerce.post('orders', data, (error, data, wooRes) => {
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

app.listen(port, (err) => {
  if(err) {
    console.log("ERROR: ", err);
  }
  console.log("Listening of port",port);
})
