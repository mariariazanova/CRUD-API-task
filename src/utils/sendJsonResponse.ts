import { ServerResponse } from 'http';

export const sendJsonResponse = (res: ServerResponse, value?: any, statusCode = 200, message = ''): void => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(value || { message }));
};
