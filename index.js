'use strict';

var _claudiaApiBuilder = require('claudia-api-builder');

var _claudiaApiBuilder2 = _interopRequireDefault(_claudiaApiBuilder);

var _woocommerceApi = require('woocommerce-api');

var _woocommerceApi2 = _interopRequireDefault(_woocommerceApi);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _denodeify = require('denodeify');

var _denodeify2 = _interopRequireDefault(_denodeify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var api = new _claudiaApiBuilder2.default();
module.exports = api;

/**
 * Products API
 */
api.get('/products', function (req, res) {
  var WooCommerce = new _woocommerceApi2.default({
    url: req.env.configUrl,
    consumerKey: req.env.configConsumerKey,
    consumerSecret: req.env.configConsumerSecret
  });

  // const promisedWoo = denodeify(WooCommerce);
  var promisedWoo = _bluebird2.default.promisifyAll(WooCommerce);

  // const promise = Promise.resolve(
  return promisedWoo.getAsync('products', function (err, data, response) {
    if (data.statusCode === 200) {
      var formatedData = JSON.parse(response);
      return formatedData;
    } else {
      return response;
    }
  }).then(function (finalRes) {
    return finalRes;
  });
  // );
  //
  // return promise.then((res) => {
  //   return res
  // });
});
/**
 * Orders API
 */
api.post('/order', function (req, res) {
  var data = {
    order: {
      payment_details: {
        method_id: 'bacs',
        method_title: 'Direct Bank Transfer',
        paid: true
      },
      billing_address: {
        first_name: 'John',
        last_name: 'Doe',
        address_1: '969 Market',
        address_2: '',
        city: 'San Francisco',
        state: 'CA',
        postcode: '94103',
        country: 'US',
        email: 'john.doe@example.com',
        phone: '(555) 555-5555'
      },
      line_items: [{
        product_id: 14,
        quantity: 2,
        variations: {
          república: 'Sparta'
        }
      }, {
        product_id: 8,
        quantity: 1,
        variations: {
          república: 'Sparta'
        }
      }]
    }
  };

  WooCommerce.post('orders', data, function (err, data, res) {
    console.log(res);
  });
});
