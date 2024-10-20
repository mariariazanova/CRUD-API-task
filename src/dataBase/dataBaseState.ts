import path from 'node:path';
import { createReadStream, createWriteStream } from 'fs';
import { User } from '../interfaces/user';

export const FILE_PATH = path.join(__dirname, 'data.json');

let users: User[] = [];

export const loadDataFromFile = (): Promise<void> => new Promise((resolve, reject) => {
  const readStream = createReadStream(FILE_PATH, {encoding: 'utf-8'});
  let data = '';

  readStream.on('data', (chunk) => {
    data += chunk;
  });

  readStream.on('end', () => {
    if (data.trim() === '') {
      // Handle the case where the file is empty
      users = [];

      resolve();
    } else {
      try {
        users = JSON.parse(data) as User[];

        resolve();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing data:', error);
        users = [];

        resolve();
      }
    }
  });

  readStream.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('Error reading file:', error);
    reject(error);
  });
});

// Function to save data to file using createWriteStream
export const saveDataToFile = (): void => {
  // Convert users array to JSON string
  const data = JSON.stringify(users, null, 2);

  const writeStream = createWriteStream(FILE_PATH);

  writeStream.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('Error writing to file:', error);
  });

  writeStream.on('finish', () => {
    // eslint-disable-next-line no-console
    console.log('Data successfully saved to file.');
  });

  writeStream.write(data);
  writeStream.end();
};

export const getUsers = (): User[] => users;

export const setUsers = (updatedUsers: User[]): void => {
  users = updatedUsers;
};

export const addUser = (user: User): void => {
  users.push(user);
};
