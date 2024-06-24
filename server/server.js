import express from 'express';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

// File path (in the Docker container)
const filePath = path.resolve('..', 'app', 'data', 'ids.csv');
// Column name you want to import
const columnName = 'id';

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

function readCSV(filePath, columnName) {
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
      .on('data', async (data) => {
            // Process each row of data here
            const columnData = data[columnName];
            console.log(`Processing data: ${columnData}`);
            results.push(columnData);

        await myQueue.add(columnData, {itemId: columnData}, { jobId: columnData })

        })
        .on('end', () => {
            console.log(`Data in column "${columnName}":`, results);
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

async function addJobs() {
  console.log("ABOUT TO WRITE...");

  // import from CSV
  readCSV(filePath, columnName);

  // import from API (e.g. Box)


}

await addJobs();

