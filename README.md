# RepSparta.com API

Meant to be hosted on [AWS Lambda](https://aws.amazon.com/documentation/lambda/) using [claudia-api-builder](https://github.com/claudiajs/claudia-api-builder) using the `npm run build` script. Or a normal NodeJS server using `npm run build:api` script.

## Usage
Make sure you have [NodeJS](https://nodejs.org/en/) and [nodemon](http://nodemon.org) installed with `npm i -g nodemon`. If you're going to deploy the service, make sure you have [Claudia](https://github.com/claudiajs/claudia) installed with `npm i -g claudia`, and [aws-sdk](https://github.com/aws/aws-sdk-js) installed with `npm i -g npm install aws-sdk`and configured.

1. `git clone https://github.com/luandro-com/repsparta-api.git` to clone the repo
1. `cd repsparta-api`
1. `npm i` to install dependencies
1. `npm start ` to start a development Express server with nodemon and Babel
1. translate the express server to claudia-api-builer in the `service.js` file and run `npm run build` to get a  production build in `index.js` file in the root directory (required by Claudia)

Use `claudia create --name api-name --region us-east-1 --api-module index` to deploy and create a new function on AWS Lamba, and `npm run update` to update it. Change api-name for whatever name you want, and region to your region of choice.

## License

Use as you like.
