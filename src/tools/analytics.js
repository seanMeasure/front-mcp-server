import { z } from 'zod';
import * as front from '../front-client.js';

export function registerAnalyticsTools(server) {
  server.tool(
    'create_analytics_export',
    'Create a new analytics export. Returns an export ID that can be polled for completion.',
    {
      type: z.enum(['activities', 'messages']).describe('Export type'),
      start: z.number().describe('Start timestamp (Unix epoch seconds)'),
      end: z.number().describe('End timestamp (Unix epoch seconds)'),
      columns: z.array(z.string()).optional().describe('Columns to include in the export'),
      inbox_ids: z.array(z.string()).optional().describe('Inbox IDs to filter by'),
      tag_ids: z.array(z.string()).optional().describe('Tag IDs to filter by'),
      teammate_ids: z.array(z.string()).optional().describe('Teammate IDs to filter by'),
    },
    async ({ type, start, end, columns, inbox_ids, tag_ids, teammate_ids }) => {
      const payload = { type, start, end };
      if (columns) payload.columns = columns;
      const filters = {};
      if (inbox_ids) filters.inbox_ids = inbox_ids;
      if (tag_ids) filters.tag_ids = tag_ids;
      if (teammate_ids) filters.teammate_ids = teammate_ids;
      if (Object.keys(filters).length) payload.filters = filters;
      const data = await front.post('/analytics/exports', payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'get_analytics_export',
    'Get the status and download URL of an analytics export.',
    { export_id: z.string().describe('Export ID') },
    async ({ export_id }) => {
      const data = await front.get(`/analytics/exports/${export_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    'create_analytics_report',
    'Create a new analytics report.',
    {
      start: z.number().describe('Start timestamp (Unix epoch seconds)'),
      end: z.number().describe('End timestamp (Unix epoch seconds)'),
      metrics: z.array(z.string()).describe('Metrics to include (e.g. "num_messages_received", "avg_first_response_time")'),
      inbox_ids: z.array(z.string()).optional().describe('Inbox IDs to filter by'),
      tag_ids: z.array(z.string()).optional().describe('Tag IDs to filter by'),
      teammate_ids: z.array(z.string()).optional().describe('Teammate IDs to filter by'),
    },
    async ({ start, end, metrics, inbox_ids, tag_ids, teammate_ids }) => {
      const payload = { start, end, metrics };
      const filters = {};
      if (inbox_ids) filters.inbox_ids = inbox_ids;
      if (tag_ids) filters.tag_ids = tag_ids;
      if (teammate_ids) filters.teammate_ids = teammate_ids;
      if (Object.keys(filters).length) payload.filters = filters;
      const data = await front.post('/analytics/reports', payload);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
