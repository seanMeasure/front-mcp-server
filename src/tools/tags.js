import { z } from 'zod';
import * as front from '../front-client.js';

export function registerTagTools(server) {
  server.tool(
    'list_tags',
    'List all tags in the workspace.',
    {},
    async () => {
      const data = await front.get('/tags');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_tag',
    'Get a tag by ID.',
    { tag_id: z.string().describe('Tag ID (e.g. tag_abc123)') },
    async ({ tag_id }) => {
      const data = await front.get(`/tags/${tag_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'create_tag',
    'Create a new tag.',
    {
      name: z.string().describe('Tag name'),
      highlight: z.enum(['grey', 'pink', 'red', 'orange', 'yellow', 'green', 'light-blue', 'blue', 'purple']).optional().describe('Tag color'),
      parent_tag_id: z.string().optional().describe('Parent tag ID for nested tags'),
    },
    async ({ name, highlight, parent_tag_id }) => {
      const payload = { name };
      if (highlight) payload.highlight = highlight;
      // If parent_tag_id, create as child tag
      if (parent_tag_id) {
        const data = await front.post(`/tags/${parent_tag_id}/children`, payload);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }
      const data = await front.post('/tags', payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'list_tagged_conversations',
    'List conversations that have a specific tag.',
    {
      tag_id: z.string().describe('Tag ID'),
      page_token: z.string().optional().describe('Pagination token'),
    },
    async ({ tag_id, page_token }) => {
      const params = {};
      if (page_token) params.page_token = page_token;
      const data = await front.get(`/tags/${tag_id}/conversations`, params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
