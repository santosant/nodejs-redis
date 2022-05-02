import express from "express";

const app = express();

app.get("/", (req, res) => res.send("server is running"));

app.get("users", () => {});

app.listen(3000);
