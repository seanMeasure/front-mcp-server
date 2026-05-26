import { z } from 'zod';
import * as front from '../front-client.js';

export function registerTeammateTools(server) {
  server.tool(
    'list_teammates',
    'List all teammates in the workspace.',
    {},
    async () => {
      const data = await front.get('/teammates');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_teammate',
    'Get a teammate by ID.',
    { teammate_id: z.string().describe('Teammate ID (e.g. tea_abc123)') },
    async ({ teammate_id }) => {
      const data = await front.get(`/teammates/${teammate_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'list_assigned_conversations',
    'List conversations assigned to a specific teammate.',
    {
      teammate_id: z.string().describe('Teammate ID'),
      q: z.string().optional().describe('Search query to filter conversations'),
      page_token: z.string().optional().describe('Pagination token'),
    },
    async ({ teammate_id, q, page_token }) => {
      const params = {};
      if (q) params.q = q;
      if (page_token) params.page_token = page_token;
      const data = await front.get(`/teammates/${teammate_id}/conversations`, params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
