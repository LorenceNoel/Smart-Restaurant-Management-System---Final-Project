const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'smart_restaurant',
});

module.exports = pool.promise();