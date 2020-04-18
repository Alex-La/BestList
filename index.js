const express = require("express");
const http = require("http");
const mariadb = require("mariadb");
const bodyParser = require("body-parser");

const pool = mariadb.createPool({
  host: "127.0.0.1",
  user: "root",
  database: "best",
  connectionLimit: 5,
});

const app = express();
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.send("<h1>Hello World!</h1>");
});

app.get("/get", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM users ORDER BY best_time ASC");
    res.json(rows);
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
});

app.post("/set", bodyParser.json(), async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const response = await conn.query(
      `INSERT INTO users (name, best_time) VALUES ('${req.body.name}', '${req.body.best_time}')`
    );
    res.status(200).json(response);
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
});

const server = http.createServer(app);
server.listen(process.env.PORT || 8080, () =>
  console.log("Server listen on port 8080")
);
