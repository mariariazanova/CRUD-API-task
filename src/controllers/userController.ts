import {IncomingMessage, ServerResponse} from 'http';
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
import { checkRequestArguments } from '../utils/checkRequestArguments';
import { RestMethod } from '../enums/restMethod';

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
  try {
    const body = await parseRequestBody(req);

    checkRequestArguments(res, body, () => createUserInDb(body), RestMethod.Post);
  } catch {
    sendJsonResponse(res, undefined, 400, 'Invalid JSON');
  }
};

export const updateUser = async (req: IncomingMessage, res: ServerResponse, pathName: string) => {
  const userId = getIdFromUrl(pathName);
  const isIdValid = isValidUUID(userId);

  if (isIdValid) {
    try {
      const body = await parseRequestBody(req);

      checkRequestArguments(res, body, () => updateUserInDb(body, userId), RestMethod.Put);
    } catch {
      sendJsonResponse(res, undefined, 400, 'Invalid JSON');
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
