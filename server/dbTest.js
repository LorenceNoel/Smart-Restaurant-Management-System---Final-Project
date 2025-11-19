const sql = require("mssql");

const config = {
  user: "sodv2201",
  password: "sodv2201",
  server: "localhost\\SQLEXPRESS",
  database: "SmartRestaurant",
  options: { trustServerCertificate: true }
};

async function testConnection() {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT TOP 5 * FROM Reservations`;
    console.log("Connected! Sample data:", result.recordset);
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testConnection();