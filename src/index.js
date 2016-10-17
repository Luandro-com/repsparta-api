'use strict';

const app = require('express')();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3001;
// const uuid = require('node-uuid').v4;
const request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
/**
 * API Router
 */
require('./router')(app);

app.listen(port, (err) => {
  if (err) {
    console.log("ERROR: ", err);
  }
  console.log("Listening of port", port);
});
