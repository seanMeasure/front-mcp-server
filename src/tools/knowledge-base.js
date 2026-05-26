import { z } from 'zod';
import * as front from '../front-client.js';

export function registerKnowledgeBaseTools(server) {
  server.tool(
    'list_knowledge_bases',
    'List all knowledge bases in your Front workspace.',
    {},
    async () => {
      const data = await front.get('/knowledge_bases');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_knowledge_base',
    'Get a knowledge base by ID, including content in the default locale.',
    { knowledge_base_id: z.string().describe('Knowledge base ID (e.g. knb_abc123)') },
    async ({ knowledge_base_id }) => {
      const data = await front.get(`/knowledge_bases/${knowledge_base_id}/content`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'list_kb_articles',
    'List articles in a knowledge base.',
    {
      knowledge_base_id: z.string().describe('Knowledge base ID'),
      page_token: z.string().optional().describe('Pagination token'),
    },
    async ({ knowledge_base_id, page_token }) => {
      const params = {};
      if (page_token) params.page_token = page_token;
      const data = await front.get(`/knowledge_bases/${knowledge_base_id}/articles`, params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_kb_article',
    'Get a knowledge base article by ID (metadata only, no content).',
    { article_id: z.string().describe('Article ID (e.g. kba_abc123)') },
    async ({ article_id }) => {
      const data = await front.get(`/knowledge_base_articles/${article_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_kb_article_content',
    'Get a knowledge base article with its full HTML content in the default locale.',
    { article_id: z.string().describe('Article ID') },
    async ({ article_id }) => {
      const data = await front.get(`/knowledge_base_articles/${article_id}/content`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'update_kb_article_content',
    'Update a knowledge base article content in the default locale.',
    {
      article_id: z.string().describe('Article ID'),
      title: z.string().optional().describe('Article title'),
      body: z.string().optional().describe('Article HTML body content'),
      status: z.enum(['draft', 'published']).optional().describe('Article status'),
    },
    async ({ article_id, ...updates }) => {
      const payload = {};
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) payload[key] = val;
      }
      const data = await front.patch(`/knowledge_base_articles/${article_id}/content`, payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'create_kb_article',
    'Create a new article in a knowledge base (default locale).',
    {
      knowledge_base_id: z.string().describe('Knowledge base ID'),
      category_id: z.string().describe('Category ID to place the article in'),
      title: z.string().describe('Article title'),
      body: z.string().optional().describe('Article HTML body content'),
      status: z.enum(['draft', 'published']).optional().describe('Article status (default: draft)'),
      author_id: z.string().optional().describe('Teammate ID of the author'),
    },
    async ({ knowledge_base_id, ...articleData }) => {
      const data = await front.post(`/knowledge_bases/${knowledge_base_id}/articles`, articleData);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'delete_kb_article',
    'Delete a knowledge base article.',
    { article_id: z.string().describe('Article ID') },
    async ({ article_id }) => {
      await front.del(`/knowledge_base_articles/${article_id}`);
      return { content: [{ type: 'text', text: 'Article deleted successfully.' }] };
    }
  );

  server.tool(
    'list_kb_categories',
    'List categories in a knowledge base.',
    {
      knowledge_base_id: z.string().describe('Knowledge base ID'),
      page_token: z.string().optional().describe('Pagination token'),
    },
    async ({ knowledge_base_id, page_token }) => {
      const params = {};
      if (page_token) params.page_token = page_token;
      const data = await front.get(`/knowledge_bases/${knowledge_base_id}/categories`, params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_kb_category_content',
    'Get a knowledge base category with its content in the default locale.',
    { category_id: z.string().describe('Category ID') },
    async ({ category_id }) => {
      const data = await front.get(`/knowledge_base_categories/${category_id}/content`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
