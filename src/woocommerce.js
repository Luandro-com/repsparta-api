const WooCommerceAPI = require('woocommerce-api');
const config = require('../config')
const configUrl = process.env.URL || config.adminUrl;
const configConsumerKey = process.env.CONSUMERKEY || config.consumerKey;
const configConsumerSecret = process.env.CONSUMERSECRET || config.consumerSecret;

const WooCommerce = new WooCommerceAPI({
  url: configUrl,
  consumerKey: configConsumerKey,
  consumerSecret: configConsumerSecret
});

module.exports = WooCommerce;
