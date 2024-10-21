import dotenv from 'dotenv';
import { startServer } from './server';


dotenv.config();

const PORT = process.env.PORT || 4000;

export const server = startServer(PORT);
