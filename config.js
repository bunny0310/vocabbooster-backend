const util = require('util');
const mongoose = require('mongoose');
const mysql = require('mysql');

const connection  = mysql.createPool({
    connectionLimit : 10,
    host            : 'us-cdbr-east-05.cleardb.net',
    user            : 'bf572094035a1e',
    password        : '55649612',
    database        : 'heroku_1d45885be1a99ca'
  });

  connection.query = util.promisify(connection.query);

const mongoose_connection = () => {
  mongoose.connect('mongodb+srv://ikhurana:root@cluster0.gc8z6.mongodb.net/db?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
  const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  // console.log('Awesome!');
});
return mongoose;
}

  module.exports = {connection, mongoose_connection};
