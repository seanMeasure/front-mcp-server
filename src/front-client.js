import axios from 'axios';

const BASE_URL = 'https://api2.frontapp.com';

let client;

function getClient() {
  if (client) return client;

  const token = process.env.FRONT_API_TOKEN;
  if (!token) {
    throw new Error('FRONT_API_TOKEN environment variable is required');
  }

  client = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  return client;
}

async function request(method, path, { params, data } = {}) {
  const http = getClient();

  try {
    const response = await http.request({ method, url: path, params, data });
    return response.data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;

      // Rate limited — include retry info
      if (status === 429) {
        const retryAfter = err.response.headers['retry-after'];
        throw new Error(
          `Front API rate limited (429). Retry after ${retryAfter || 'unknown'} seconds.`
        );
      }

      const message = data?._error?.message || data?.message || JSON.stringify(data);
      throw new Error(`Front API error ${status}: ${message}`);
    }
    throw new Error(`Front API request failed: ${err.message}`);
  }
}

export async function get(path, params) {
  return request('GET', path, { params });
}

export async function post(path, data) {
  return request('POST', path, { data });
}

export async function patch(path, data) {
  return request('PATCH', path, { data });
}

export async function put(path, data) {
  return request('PUT', path, { data });
}

export async function del(path, data) {
  return request('DELETE', path, { data });
}

/**
 * Fetch a paginated list endpoint. Returns up to `maxPages` pages of results.
 * Front uses `_pagination.next` for cursor-based pagination.
 */
export async function paginate(path, { params, maxPages = 3 } = {}) {
  const allResults = [];
  let url = path;
  let currentParams = params;
  let pages = 0;

  while (url && pages < maxPages) {
    const response = await get(url, currentParams);
    const results = response._results || [];
    allResults.push(...results);
    pages++;

    // After first request, pagination URL is absolute — switch to it directly
    const nextUrl = response._pagination?.next;
    if (nextUrl) {
      url = nextUrl;
      currentParams = undefined; // params are baked into the next URL
    } else {
      break;
    }
  }

  return allResults;
}
