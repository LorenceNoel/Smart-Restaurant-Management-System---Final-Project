// server/server.js
const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ SQL Server config
const config = {
  user: "sodv2201",
  password: "sodv2201",
  server: "localhost\\SQLEXPRESS", // double backslash in JS
  database: "SmartRestaurant",
  options: { trustServerCertificate: true }
};

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running on port 5000" });
});

// ✅ Menu routes
app.get("/api/menu", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.request().query("SELECT * FROM MenuItems");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/menu", async (req, res) => {
  const { name, description, category, price, tags } = req.body;
  try {
    await sql.connect(config);
    await sql.request()
      .input("Name", sql.NVarChar(100), name)
      .input("Description", sql.NVarChar(255), description)
      .input("Category", sql.NVarChar(50), category)
      .input("Price", sql.Decimal(10,2), price)
      .input("Tags", sql.NVarChar(200), tags)
      .query("INSERT INTO MenuItems (Name, Description, Category, Price, Tags) VALUES (@Name, @Description, @Category, @Price, @Tags)");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/menu/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, tags } = req.body;
  try {
    await sql.connect(config);
    await sql.request()
      .input("Id", sql.Int, id)
      .input("Name", sql.NVarChar(100), name)
      .input("Description", sql.NVarChar(255), description)
      .input("Category", sql.NVarChar(50), category)
      .input("Price", sql.Decimal(10,2), price)
      .input("Tags", sql.NVarChar(200), tags)
      .query("UPDATE MenuItems SET Name=@Name, Description=@Description, Category=@Category, Price=@Price, Tags=@Tags WHERE Id=@Id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Users router
const usersRouter = require("./routes/users");
app.use("/api/users", usersRouter);

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));