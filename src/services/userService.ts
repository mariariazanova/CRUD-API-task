import { v4 } from 'uuid';
import { User } from '../interfaces/user';
import {
  getUsers, addUser, setUsers, saveDataToFile,
} from '../dataBase/dataBaseState';

export const getAllUsersFromDb = (): User[] => getUsers();

export const getUserByIdFromDb = (id: string): User | undefined => {
  const users = getUsers();

  return users.find((user) => user.id === id);
};

export const createUserInDb = (userData: Omit<User, 'id'>): User => {
  const newUser: User = { id: v4(), ...userData };

  addUser(newUser);
  saveDataToFile();

  return newUser;
};

export const updateUserInDb = (userData: Partial<Omit<User, 'id'>>, id: string): User | undefined => {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return undefined;
  }
  const updatedUser = { ...users[userIndex], ...userData };

  users[userIndex] = updatedUser;
  setUsers(users);
  saveDataToFile();

  return updatedUser;
};

export const deleteUserInDb = (id: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return false;
  }

  users.splice(userIndex, 1);
  setUsers(users);
  saveDataToFile();

  return true;
};
