const express = require("express");
const http = require("http");
const pg = require("pg");
const bodyParser = require("body-parser");

const Pool = pg.Pool;
const pool = new Pool({
  user: "woiydotgaapcda",
  host: "ec2-54-159-112-44.compute-1.amazonaws.com",
  database: "d3gs3l95rt24gp",
  password: "5a8639cca56df406822f98a96bd03003f44b8f4ec0a5fc135265eb983b76c758",
  port: "5432",
  ssl: true,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const app = express();
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.send("<h1>Hello World!</h1>");
});

app.get("/get", async (req, res) => {
  try {
    pool.connect().then((client) => {
      return client
        .query("SELECT * FROM users ORDER BY best_time AS")
        .then((result) => {
          client.release();
          res.json(result.rows);
        })
        .catch((e) => {
          client.release();
          console.log(e.stack);
        });
    });
  } catch (e) {
    res.json("Server is closed");
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
