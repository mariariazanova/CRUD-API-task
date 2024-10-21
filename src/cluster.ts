import cluster from 'cluster';
import os from 'os';
import http, { ServerResponse } from 'http';
import { startServer } from './server';
import { saveDataToFile, setUsers } from './dataBase/dataBaseState';

const BASE_PORT = parseInt(process.env.PORT || '4000', 10);
const numCPUs = os.cpus().length;
const workerPorts = Array.from({ length: numCPUs - 1 }, (_, i) => BASE_PORT + i + 1);

if (cluster.isPrimary) {
  // Primary process acts as the load balancer
  // eslint-disable-next-line no-console
  console.log(`Master ${ process.pid } is running`);

  // Fork worker processes for each CPU (except the one for the master process)
  workerPorts.forEach(() => cluster.fork());

  let currentWorker = 0;

  // Create the load balancer that listens on the base port
  const loadBalancer = http.createServer((req, res: ServerResponse) => {
    // Forward requests to the next worker in a round-robin fashion
    const workerPort = workerPorts[currentWorker];
    console.log(`Worker on port ${ workerPort} receives request ${ req.method} ${ req.url }`);

    const proxy = http.request(
      {
        hostname: 'localhost',
        port: workerPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (workerRes) => {
        res.writeHead(workerRes.statusCode || 500, workerRes.headers);
        workerRes.pipe(res, { end: true });
      },
    );

    req.pipe(proxy, { end: true });

    // Move to the next worker (round-robin)
    currentWorker = (currentWorker + 1) % workerPorts.length;
  });

  loadBalancer.listen(BASE_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Load balancer listening on port ${ BASE_PORT }`);
  });

  // If a worker dies, restart it
  cluster.on('exit', (worker) => {
    // eslint-disable-next-line no-console
    console.log(`Worker ${ worker.process.pid } died, restarting...`);
    cluster.fork();
  });

  process.on('SIGINT', () => {
    setUsers([]);
    saveDataToFile();

    loadBalancer.close((err) => {
      if (err) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    });
  });
} else {
  // Worker processes: Each worker runs on its own port (e.g., 4001, 4002, ...)
  const workerId = cluster.worker?.id || 1;
  const workerPort = BASE_PORT + workerId;
  console.log(`Worker with workerId ${ workerId } is working on port ${ workerPort }`);

  const server = startServer(workerPort);

  process.on('SIGINT', () => {
    setUsers([]);
    saveDataToFile();

    server.close((err) => {
      if (err) {
        console.error('Error while closing server:', err.message);
        process.exit(1);
      } else {
        console.log(`Worker ${ workerId } closed.`);
        process.exit(0);
      }
    });
  });
}
