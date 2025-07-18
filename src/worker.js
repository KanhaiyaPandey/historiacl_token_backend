import { Worker } from "bullmq";
import { connectMongo } from "./config/mongo.js";
import { redisConnection } from "./config/redis.js";
import { processPriceJob } from "./jobs/schedulePriceJob.js"; // ✅ make sure this path and name is correct

// Connect to MongoDB
await connectMongo();

// Create a BullMQ worker
const worker = new Worker("price-queue", processPriceJob, {
  connection: redisConnection,
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});

console.log("👷 Worker is running and waiting for jobs...");
