import express from 'express';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';

const redisOptions = { host: "redis", port: 6379 }
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const myQueue = new Queue('foo', {
  connection: redisOptions
});

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullMQAdapter(myQueue)],
serverAdapter: serverAdapter,
});

const app = express();

app.use('/admin/queues', serverAdapter.getRouter());

// other configurations of your server

app.listen(3000, () => {
console.log('Running on 3000...');
console.log('For the UI, open http://localhost:3000/admin/queues');
console.log('Make sure Redis is running on port 6379 by default');
});

async function addJobs() {
  console.log("ABOUT TO WRITE...");
  await myQueue.add('myJobName', { foo: 'bar' });
  await myQueue.add('myJobName', { qux: 'baz' });
}

await addJobs();

