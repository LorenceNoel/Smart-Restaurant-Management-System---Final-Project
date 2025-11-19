const sql = require("mssql");

const config = {
  user: "sodv2201",              
  password: "sodv2201",          
  server: "localhost\\SQLEXPRESS", 
  database: "SmartRestaurant",   
  options: {
    trustServerCertificate: true
  }
};