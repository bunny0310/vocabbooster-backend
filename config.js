const mysql = require("mysql");

const connection  = mysql.createPool({
    connectionLimit : 10,
    host            : 'us-cdbr-east-05.cleardb.net',
    user            : 'bf572094035a1e',
    password        : '55649612',
    database        : 'heroku_1d45885be1a99ca'
  });

  module.exports = {connection};