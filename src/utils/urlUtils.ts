import { parse } from 'url';
import { ParsedUrlQuery } from 'querystring';

export interface ParsedUrl {
  pathname: string;
  query: ParsedUrlQuery;
}

export const parseUrl = (url: string): ParsedUrl => {
  const parsedUrl = parse(url, true);
  const pathname = parsedUrl.pathname || '/';
  const { query } = parsedUrl;

  return { pathname, query };
};

export const getIdFromUrl = (url: string): string => {
  const pathSegments = url.split('/');

  return pathSegments[pathSegments.length - 1];
};
