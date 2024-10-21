import { sendJsonResponse } from './sendJsonResponse';
import { RestMethod } from '../enums/restMethod';

const requiredKeys: Array<string> = ['username', 'age', 'hobbies'];

export const checkRequestArguments = (
  res: any,
  body: any,
  fn: (body: any, userId?: string) => any,
  method: RestMethod,
  userId?: string,
) => {
  if (Object.keys(body).every((key: string) => requiredKeys.includes(key))) {
    if (!body.username || !body.age || !body.hobbies) {
      sendJsonResponse(res, undefined, 400, 'Not all required fields are filled');
    } else if (
      (body?.username && typeof body.username !== 'string') ||
      (body?.age && typeof body.age !== 'number') ||
      (body?.hobbies && !Array.isArray(body.hobbies)) ||
      (body?.hobbies && !!body.hobbies.length && body.hobbies.some((item: string) => typeof item !== 'string'))
    ) {
      sendJsonResponse(res, undefined, 400, 'Not correct data format');
    } else {
      const user = fn(userId, body);

      if (method === RestMethod.Post) {
        sendJsonResponse(res, user, 201)
      } else {
        user ? sendJsonResponse(res, user) : sendJsonResponse(res, undefined, 404, 'User not found');
      }
    }
  } else {
    if (Object.keys(body).some((key: string) => key === 'id')) {
      sendJsonResponse(res, undefined, 400, 'No access to change user id');
    } else {
      sendJsonResponse(res, undefined, 400, 'No such properties in interface');
    }
  }
};
