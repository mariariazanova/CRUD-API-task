import {
  createServer, IncomingMessage, ServerResponse, Server,
} from 'http';
import { handleRequest } from './routes/userRoutes';
import { sendJsonResponse } from './utils/sendJsonResponse';
import { saveDataToFile, setUsers } from './dataBase/dataBaseState';

export const startServer = (port: string | number):Server => {
  // await createWriteStream(FILE_PATH);

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    try {
      handleRequest(req, res).then();
    } catch (error) {
      sendJsonResponse(res, undefined, 500, 'An internal server error occurred. Please try again later.');
    }
  });

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', () => {
    console.log('Server has been closed because of error');
    setUsers([]);
    saveDataToFile();

    process.exit(1);
  })

  process.on('SIGINT', () => {
    setUsers([]);
    saveDataToFile();

    server.close((err) => {
      if (err) {
        console.error('Server has been closed because of error');
        process.exit(1);
      } else {
        console.log('Server has been closed.');
        process.exit(0);
      }
    });
  });

  return server;
};
