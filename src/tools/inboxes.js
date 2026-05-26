import { z } from 'zod';
import * as front from '../front-client.js';

export function registerInboxTools(server) {
  server.tool(
    'list_inboxes',
    'List all inboxes in the workspace.',
    {},
    async () => {
      const data = await front.get('/inboxes');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_inbox',
    'Get an inbox by ID.',
    { inbox_id: z.string().describe('Inbox ID (e.g. inb_abc123)') },
    async ({ inbox_id }) => {
      const data = await front.get(`/inboxes/${inbox_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'list_inbox_conversations',
    'List conversations in a specific inbox.',
    {
      inbox_id: z.string().describe('Inbox ID'),
      q: z.string().optional().describe('Search query to filter conversations'),
      page_token: z.string().optional().describe('Pagination token'),
    },
    async ({ inbox_id, q, page_token }) => {
      const params = {};
      if (q) params.q = q;
      if (page_token) params.page_token = page_token;
      const data = await front.get(`/inboxes/${inbox_id}/conversations`, params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
