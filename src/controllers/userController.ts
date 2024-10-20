import { IncomingMessage, ServerResponse } from 'http';
import {
  createUserInDb,
  deleteUserInDb,
  getAllUsersFromDb,
  getUserByIdFromDb,
  updateUserInDb,
} from '../services/userService';
import { sendJsonResponse } from '../utils/sendJsonResponse';
import { parseRequestBody } from '../utils/parseRequestBody';
import { getIdFromUrl } from '../utils/urlUtils';
import { isValidUUID } from '../utils/validationUtils';

export const getAllUsers = (res: ServerResponse): void => {
  const users = getAllUsersFromDb();

  sendJsonResponse(res, users);
};

export const getUserById = (res: ServerResponse, pathName: string): void => {
  const userId = getIdFromUrl(pathName);
  const isIdValid = isValidUUID(userId);

  if (isIdValid) {
    const user = getUserByIdFromDb(userId);

    user ? sendJsonResponse(res, user) : sendJsonResponse(res, undefined, 404, 'User not found');
  } else {
    sendJsonResponse(res, undefined, 400, 'User id is invalid');
  }
};

export const createUser = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await parseRequestBody(req);

  if (!body.username || !body.age || !body.hobbies) {
    sendJsonResponse(res, undefined, 400, 'Not all required fields are filled');
  } else if (typeof body.username !== 'string' || typeof body.age !== 'number' || !Array.isArray(body.hobbies) || body.hobbies.some((item: string) => typeof item !== 'string')) {
    sendJsonResponse(res, undefined, 400, 'Not correct data format');
  } else {
      const newUser = createUserInDb(body);

      sendJsonResponse(res, newUser, 201);
  }
};

export const updateUser = async (req: IncomingMessage, res: ServerResponse, pathName: string) => {
  const userId = getIdFromUrl(pathName);
  const isIdValid = isValidUUID(userId);

  if (isIdValid) {
    const body = await parseRequestBody(req);
    const requiredKeys: Array<string> = ['username', 'age', 'hobbies'];

    if (Object.keys(body).every((key:string) => requiredKeys.includes(key))) {
    // if (Object.keys(body).every(key => key in requiredKeys)) {
      if ((body?.username && typeof body.username !== 'string') || (body?.age && typeof body.age !== 'number') || (body?.hobbies && !Array.isArray(body.hobbies)) && body.hobbies.some((item: string) => typeof item !== 'string')) {
        sendJsonResponse(res, undefined, 400, 'Not correct data format');
      } else {
        const updatedUser = updateUserInDb(userId, body);

        updatedUser ? sendJsonResponse(res, updatedUser) : sendJsonResponse(res, undefined, 404, 'User not found');
      }
    } else if (Object.keys(body).some((key:string) => key === 'id')) {
      sendJsonResponse(res, undefined, 400, 'No access to change user id');
    } else {
      sendJsonResponse(res, undefined, 400, 'No such properties in interface');
    }
  } else {
    sendJsonResponse(res, undefined, 400, 'User id is invalid');
  }
};

export const deleteUser = (res: ServerResponse, pathName: string) => {
  const userId = getIdFromUrl(pathName);
  const isIdValid = isValidUUID(userId);

  if (isIdValid) {
    const isUserDeleted = deleteUserInDb(userId);

    isUserDeleted ? sendJsonResponse(res, undefined, 204) : sendJsonResponse(res, undefined, 404, 'User not found');
  } else {
    sendJsonResponse(res, undefined, 400, 'User id is invalid');
  }
};
