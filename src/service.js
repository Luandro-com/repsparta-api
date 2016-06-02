import ApiBuilder from 'claudia-api-builder';
import WooCommerceAPI from 'woocommerce-api';
import Promise from 'bluebird';
import denodeify from 'denodeify';
const api = new ApiBuilder();
module.exports = api;

/**
 * Products API
 */
api.get('/products', (req, res) => {
  const WooCommerce = new WooCommerceAPI({
    url: req.env.configUrl,
    consumerKey: req.env.configConsumerKey,
    consumerSecret: req.env.configConsumerSecret,
  });

  // const promisedWoo = denodeify(WooCommerce);
  const promisedWoo = Promise.promisifyAll(WooCommerce);

  // const promise = Promise.resolve(
    return promisedWoo.getAsync('products', (err, data, response) => {
      if(data.statusCode === 200) {
        const formatedData = JSON.parse(response)
        return formatedData;
      } else {
        return response;
      }
    })
    .then((finalRes) => {
      return finalRes
    })
  // );
  //
  // return promise.then((res) => {
  //   return res
  // });
});
/**
 * Orders API
 */
api.post('/order', (req, res) => {
  const data = {
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
     line_items: [
       {
         product_id: 14,
         quantity: 2,
         variations: {
           república: 'Sparta'
         }
       },
       {
         product_id: 8,
         quantity: 1,
         variations: {
           república: 'Sparta'
         }
       }
     ]
   }
 };

  WooCommerce.post('orders', data, (err, data, res) => {
   console.log(res);
  });
})
