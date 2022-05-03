import express from "express";
import UserController from "./controllers/UserController";
import redis from "./lib/cache";

const app = express();

app.get("/", (req, res) => res.send("server is running"));

app.get("/users", UserController.find);

app.get("/clear-cache", async (req, res) => {
  await redis.del("users:all");

  console.log("Cache cleaned");
  res.json({
    ok: true,
  });
});

app.listen(3000);
