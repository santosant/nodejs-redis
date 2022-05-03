import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import redis from "../lib/cache";

const prisma = new PrismaClient();

class UserController {
  static async find(req: Request, res: Response) {
    try {
      const ipAddress =
        req.headers["x-forward-for"] || req.connection.remoteAddress;

      const requests = await redis.incr(ipAddress);

      let ttl;
      if (requests === 1) {
        await redis.expire(ipAddress, 60);
        ttl = 60;
      } else {
        ttl = await redis.ttl(ipAddress);
      }

      if (requests > 20) {
        return res.status(503).json({
          response: "error",
          callsInAMinute: requests,
          ttl,
        });
      }

      const cacheKey = "users:all";

      const cachedUsers = await redis.get(cacheKey);

      console.time("Find users");

      if (cachedUsers) {
        console.timeEnd("Find users");
        return res.json(JSON.parse(cachedUsers));
      }

      const users = await prisma.user.findMany();

      console.timeEnd("Find users");

      await redis.set(cacheKey, JSON.stringify(users));

      return res.json(users);
    } catch (e) {
      console.log(e);
      return res.json({
        error: e,
      });
    }
  }
}

export default UserController;
