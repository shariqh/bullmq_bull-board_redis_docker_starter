import { Worker } from 'bullmq';

const redisOptions = { host: "redis", port: 6379 }

const worker = new Worker('foo', async job => {
  console.log(job.data);}, { 
connection: redisOptions}); 