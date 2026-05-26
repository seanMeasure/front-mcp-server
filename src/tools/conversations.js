import { z } from 'zod';
import * as front from '../front-client.js';

export function registerConversationTools(server) {
  server.tool(
    'list_conversations',
    'List conversations in Front. Supports filtering by query string (same syntax as Front search bar, e.g. "is:unassigned", "tag:bug", "after:2024-01-01").',
    {
      q: z.string().optional().describe('Search query (Front search syntax)'),
      page_token: z.string().optional().describe('Pagination token from previous response'),
    },
    async ({ q, page_token }) => {
      const params = {};
      if (q) params.q = q;
      if (page_token) params.page_token = page_token;
      const data = await front.get('/conversations', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_conversation',
    'Get a single conversation by ID.',
    { conversation_id: z.string().describe('Conversation ID (e.g. cnv_abc123)') },
    async ({ conversation_id }) => {
      const data = await front.get(`/conversations/${conversation_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'search_conversations',
    'Search conversations by query string. Uses Front search syntax (e.g. "subject:invoice", "from:user@example.com", "tag:urgent").',
    { query: z.string().describe('Search query string') },
    async ({ query }) => {
      const data = await front.get(`/conversations/search/${encodeURIComponent(query)}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'list_conversation_messages',
    'List messages in a conversation.',
    {
      conversation_id: z.string().describe('Conversation ID'),
      page_token: z.string().optional().describe('Pagination token'),
    },
    async ({ conversation_id, page_token }) => {
      const params = {};
      if (page_token) params.page_token = page_token;
      const data = await front.get(`/conversations/${conversation_id}/messages`, params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'list_conversation_comments',
    'List internal comments on a conversation.',
    {
      conversation_id: z.string().describe('Conversation ID'),
    },
    async ({ conversation_id }) => {
      const data = await front.get(`/conversations/${conversation_id}/comments`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'add_conversation_comment',
    'Add an internal comment to a conversation.',
    {
      conversation_id: z.string().describe('Conversation ID'),
      body: z.string().describe('Comment body text'),
      author_id: z.string().optional().describe('Teammate ID for the comment author'),
    },
    async ({ conversation_id, body, author_id }) => {
      const payload = { body };
      if (author_id) payload.author_id = author_id;
      const data = await front.post(`/conversations/${conversation_id}/comments`, payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'update_conversation',
    'Update a conversation (e.g. change status, assignee, subject). Assignee can be set via assignee_id, or use "update_conversation_assignee" for just reassignment.',
    {
      conversation_id: z.string().describe('Conversation ID'),
      assignee_id: z.string().optional().describe('Teammate ID to assign to'),
      inbox_id: z.string().optional().describe('Inbox ID to move to'),
      status: z.enum(['archived', 'deleted', 'open', 'spam']).optional().describe('Conversation status'),
      subject: z.string().optional().describe('Conversation subject'),
      tag_ids: z.array(z.string()).optional().describe('List of tag IDs to set'),
    },
    async ({ conversation_id, ...updates }) => {
      const payload = {};
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) payload[key] = val;
      }
      const data = await front.patch(`/conversations/${conversation_id}`, payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'update_conversation_assignee',
    'Assign or unassign a conversation to a teammate.',
    {
      conversation_id: z.string().describe('Conversation ID'),
      assignee_id: z.string().describe('Teammate ID to assign to, or empty string to unassign'),
    },
    async ({ conversation_id, assignee_id }) => {
      const data = await front.put(`/conversations/${conversation_id}/assignee`, { assignee_id });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'add_conversation_tag',
    'Add a tag to a conversation.',
    {
      conversation_id: z.string().describe('Conversation ID'),
      tag_ids: z.array(z.string()).describe('Tag IDs to add'),
    },
    async ({ conversation_id, tag_ids }) => {
      const data = await front.post(`/conversations/${conversation_id}/tags`, { tag_ids });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'remove_conversation_tag',
    'Remove a tag from a conversation.',
    {
      conversation_id: z.string().describe('Conversation ID'),
      tag_ids: z.array(z.string()).describe('Tag IDs to remove'),
    },
    async ({ conversation_id, tag_ids }) => {
      const data = await front.del(`/conversations/${conversation_id}/tags`, { tag_ids });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
