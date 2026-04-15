import dotenv from "dotenv";
dotenv.config();

import { dirname } from "path";
import { fileURLToPath } from "url";
import { authenticate } from "./src/module/auth/auth.middleware.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

import app from "./src/app.js";
import { getPool} from "./src/common/config/db.js";

const port = process.env.PORT || 8080;


const pool = getPool();


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats");
  res.send(result.rows);
});



app.put("/:id/:name", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.params.name;

    // payment integration should be here
    // verify payment

    const conn = await pool.connect();
    await conn.query("BEGIN");
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    if (result.rowCount === 0) {
      res.send({ error: "Seat already booked" });
      return;
    }

    const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, name]); 


    await conn.query("COMMIT");
    conn.release(); 
    res.send(updateResult);
  } catch (ex) {
    console.log(ex);
    res.status(500).json("Internal Error");
  }
});

app.listen(port, () => console.log("Server starting on port: " + port));