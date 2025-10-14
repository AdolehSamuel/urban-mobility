const cors = require("cors");
const { urlencoded } = require("express");

const tripsRouter = require("./routes/trips");

const express = require("express");
const app = express();

app.use(cors());

app.use(urlencoded({ extended: false }));

app.get("/", (_, res) => {
  return res.send("Welcome to Urban Mobility Analytics API");
});

app.use("/trips", tripsRouter);

module.exports = app;
