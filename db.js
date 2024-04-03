import mongoose from "mongoose";

const mongoURL = process.env.mongodbURL;

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on("error", () => {
  console.log("error occured while connecting to mongodb ");
});

db.on("connected", () => {
  console.log("mongodb connected ");
});

export default db;
