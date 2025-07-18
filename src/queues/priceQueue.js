import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const priceQueue = new Queue("price-queue", {
  connection: redisConnection,
});




