// server/routes/users.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");

const config = {
  user: "sodv2201",
  password: "sodv2201",
  server: "localhost\\SQLEXPRESS", 
  database: "SmartRestaurant",
  options: { trustServerCertificate: true }
};
router.post("/register", (req, res) => {
  console.log("✅ Register route hit");
  res.json({ success: true });
});

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    await sql.connect(config);
    await sql.request()
      .input("Name", sql.NVarChar(100), name)
      .input("Email", sql.NVarChar(100), email)
      .input("Password", sql.NVarChar(100), password)
      .input("Role", sql.NVarChar(50), role || "customer")
      .query("INSERT INTO Users (Name, Email, Password, Role) VALUES (@Name, @Email, @Password, @Role)");
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    await sql.connect(config);
    const result = await sql.request()
      .input("Email", sql.NVarChar(100), email)
      .input("Password", sql.NVarChar(100), password)
      .query("SELECT * FROM Users WHERE Email=@Email AND Password=@Password");

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.recordset[0];
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;