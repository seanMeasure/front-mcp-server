import { z } from 'zod';
import * as front from '../front-client.js';

export function registerContactTools(server) {
  server.tool(
    'list_contacts',
    'List contacts. Supports filtering by query string and sorting.',
    {
      q: z.string().optional().describe('Search query to filter contacts'),
      page_token: z.string().optional().describe('Pagination token'),
      sort_by: z.string().optional().describe('Field to sort by'),
      sort_order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    },
    async ({ q, page_token, sort_by, sort_order }) => {
      const params = {};
      if (q) params.q = q;
      if (page_token) params.page_token = page_token;
      if (sort_by) params.sort_by = sort_by;
      if (sort_order) params.sort_order = sort_order;
      const data = await front.get('/contacts', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_contact',
    'Get a contact by ID.',
    { contact_id: z.string().describe('Contact ID (e.g. crd_abc123)') },
    async ({ contact_id }) => {
      const data = await front.get(`/contacts/${contact_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'create_contact',
    'Create a new contact.',
    {
      name: z.string().optional().describe('Contact name'),
      description: z.string().optional().describe('Contact description'),
      handles: z.array(z.object({
        handle: z.string().describe('Handle value (email, phone, etc.)'),
        source: z.enum(['email', 'phone', 'twitter', 'facebook', 'intercom', 'front_chat', 'custom']).describe('Handle source type'),
      })).optional().describe('Contact handles (email, phone, etc.)'),
      group_names: z.array(z.string()).optional().describe('Contact group names to add this contact to'),
      custom_fields: z.record(z.string(), z.any()).optional().describe('Custom field values'),
    },
    async ({ name, description, handles, group_names, custom_fields }) => {
      const payload = {};
      if (name) payload.name = name;
      if (description) payload.description = description;
      if (handles) payload.handles = handles;
      if (group_names) payload.group_names = group_names;
      if (custom_fields) payload.custom_fields = custom_fields;
      const data = await front.post('/contacts', payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'update_contact',
    'Update a contact.',
    {
      contact_id: z.string().describe('Contact ID'),
      name: z.string().optional().describe('Contact name'),
      description: z.string().optional().describe('Contact description'),
      custom_fields: z.record(z.string(), z.any()).optional().describe('Custom field values (include ALL fields to avoid erasing existing ones)'),
    },
    async ({ contact_id, ...updates }) => {
      const payload = {};
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) payload[key] = val;
      }
      const data = await front.patch(`/contacts/${contact_id}`, payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'list_contact_conversations',
    'List conversations associated with a contact.',
    {
      contact_id: z.string().describe('Contact ID'),
      q: z.string().optional().describe('Search query to filter conversations'),
      page_token: z.string().optional().describe('Pagination token'),
    },
    async ({ contact_id, q, page_token }) => {
      const params = {};
      if (q) params.q = q;
      if (page_token) params.page_token = page_token;
      const data = await front.get(`/contacts/${contact_id}/conversations`, params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
