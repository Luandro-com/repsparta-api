const pagseguro = require('pagseguro');
const config = require('../config')
const configToken = process.env.TOKEN || config.token;
const configEmail = process.env.EMAIL || config.email;

const PagSeguro = new pagseguro({
    email : configEmail,
    token: configToken,
    // mode : 'sandbox'
 });
module.exports = PagSeguro;
