import * as front from '../front-client.js';

export function registerMeTools(server) {
  server.tool(
    'get_me',
    'Get details about the current API token, including the associated teammate and permissions.',
    {},
    async () => {
      const data = await front.get('/me');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
