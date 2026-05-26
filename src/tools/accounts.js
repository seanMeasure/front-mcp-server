import { z } from 'zod';
import * as front from '../front-client.js';

export function registerAccountTools(server) {
  server.tool(
    'list_accounts',
    'List accounts in Front.',
    {
      page_token: z.string().optional().describe('Pagination token'),
      sort_by: z.string().optional().describe('Field to sort by'),
      sort_order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    },
    async ({ page_token, sort_by, sort_order }) => {
      const params = {};
      if (page_token) params.page_token = page_token;
      if (sort_by) params.sort_by = sort_by;
      if (sort_order) params.sort_order = sort_order;
      const data = await front.get('/accounts', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_account',
    'Get an account by ID.',
    { account_id: z.string().describe('Account ID (e.g. acc_abc123)') },
    async ({ account_id }) => {
      const data = await front.get(`/accounts/${account_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'create_account',
    'Create a new account.',
    {
      name: z.string().describe('Account name'),
      description: z.string().optional().describe('Account description'),
      domains: z.array(z.string()).optional().describe('Domains associated with the account'),
      external_id: z.string().optional().describe('External system ID'),
      custom_fields: z.record(z.string(), z.any()).optional().describe('Custom field values'),
    },
    async ({ name, description, domains, external_id, custom_fields }) => {
      const payload = { name };
      if (description) payload.description = description;
      if (domains) payload.domains = domains;
      if (external_id) payload.external_id = external_id;
      if (custom_fields) payload.custom_fields = custom_fields;
      const data = await front.post('/accounts', payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'update_account',
    'Update an account.',
    {
      account_id: z.string().describe('Account ID'),
      name: z.string().optional().describe('Account name'),
      description: z.string().optional().describe('Account description'),
      domains: z.array(z.string()).optional().describe('Domains (replaces existing list)'),
      external_id: z.string().optional().describe('External system ID'),
      custom_fields: z.record(z.string(), z.any()).optional().describe('Custom field values (include ALL fields to avoid erasing existing ones)'),
    },
    async ({ account_id, ...updates }) => {
      const payload = {};
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) payload[key] = val;
      }
      const data = await front.patch(`/accounts/${account_id}`, payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
