import express from "express";
import db from "./db.js";
import userRoutes from './routes/userRoutes.js'
const app = express();

app.use(express.json())
app.get("/", (req, res) => {
  res.send("server is running");
});


app.use('/',userRoutes)

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Express server initialized");
});
