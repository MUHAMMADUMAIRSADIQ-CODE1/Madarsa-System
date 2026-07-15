const httpStatus = require('./httpStatus');
const messages = require('./messages');
const rolesModule = require('./roles');
const api = require('./api');
const cms = require('./cms');

module.exports = {
  httpStatus,
  messages,
  ...rolesModule,
  api,
  cms,
};
