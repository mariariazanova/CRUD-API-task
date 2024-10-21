import { IncomingMessage, ServerResponse } from 'http';
import {
  createUser, deleteUser, getAllUsers, getUserById, updateUser,
} from '../controllers/userController';
import { RestMethod } from '../enums/restMethod';
import { sendJsonResponse } from '../utils/sendJsonResponse';
import { parseUrl } from '../utils/urlUtils';
import { loadDataFromFile } from '../dataBase/dataBaseState';

type Scenario = {
  name: string;
  appliesTo: () => boolean;
  execute: () => void;
};

type Scenarios = Record<string, Scenario>;
type ScenariosList = {
  scenarios: Scenarios;
  lastScenario: Scenario;
};

const checkRestMethod = (
  method: string | undefined,
  etalon: RestMethod,
): boolean => method === etalon;

const checkPath = (pathname: string, etalon: string): boolean => {
  // Normalize paths by removing trailing slashes for comparison
  const normalizePath = (path: string): string => path.replace(/\/+$/, '');

  const normalizedPathname = normalizePath(pathname);
  const normalizedEtalon = normalizePath(etalon);

  // Check if paths match exactly
  if (normalizedPathname === normalizedEtalon) {
    return true;
  }

  // Handle dynamic path segments
  if (normalizedEtalon.includes(':')) {
    // Extract dynamic segments from the etalon path
    const etalonParts = normalizedEtalon.split('/');
    const pathnameParts = normalizedPathname.split('/');

    // Check if the length matches
    if (etalonParts.length !== pathnameParts.length) {
      return false;
    }

    // Check if each segment matches or is a dynamic segment
    for (let i = 0; i < etalonParts.length; i += 1) {
      if (etalonParts[i] !== pathnameParts[i] && !etalonParts[i].startsWith(':')) {
        return false;
      }
    }

    return true;
  }

  // Default to false if none of the above conditions are met
  return false;
};

const handleScenarios = (scenariosList: ScenariosList): void => {
  const scenarioNames = Object.keys(scenariosList.scenarios);

  const applicableScenario = scenarioNames
    .map((name) => scenariosList.scenarios[name])
    .find((scenario) => scenario.appliesTo());

  if (applicableScenario) {
    return applicableScenario.execute();
  }

  return scenariosList.lastScenario.execute();
};

export const handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const { method, url } = req;
  const { pathname } = parseUrl(url || '');

  const scenarios: ScenariosList = {
    scenarios: {
      scenario1: {
        name: 'get all users',
        appliesTo: () => checkRestMethod(method, RestMethod.Get) && checkPath(pathname, '/api/users'),
        execute: () => getAllUsers(res),
      },
      scenario2: {
        name: 'get user by id',
        appliesTo: () => checkRestMethod(method, RestMethod.Get) && checkPath(pathname, '/api/users/:id'),
        execute: () => getUserById(res, pathname),
      },
      scenario3: {
        name: 'create user',
        appliesTo: () => checkRestMethod(method, RestMethod.Post) && checkPath(pathname, '/api/users'),
        execute: () => createUser(req, res),
      },
      scenario4: {
        name: 'update user',
        appliesTo: () => checkRestMethod(method, RestMethod.Put) && checkPath(pathname, '/api/users/:id'),
        execute: () => updateUser(req, res, pathname),
      },
      scenario5: {
        name: 'delete user',
        appliesTo: () => checkRestMethod(method, RestMethod.Delete) && checkPath(pathname, '/api/users/:id'),
        execute: () => deleteUser(res, pathname),
      },
    },
    lastScenario: {
      name: 'invalid request',
      appliesTo: () => true,
      execute: () => sendJsonResponse(res, undefined, 404, 'Endpoint is invalid'),
    },
  };

  try {
    await loadDataFromFile();
    console.log('loaded');

    handleScenarios(scenarios);
  } catch {
    // eslint-disable-next-line no-console
    console.log('Error');
  }
};
