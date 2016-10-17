const cors = require('cors');

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

module.exports = (app) => {
  app.use(cors(corsOptions));
  app.use('/api/v1/products', require('./routes/products'));
  app.use('/api/v1/orders', require('./routes/orders'));
  app.use('/api/v1/payments', require('./routes/products'));
};
