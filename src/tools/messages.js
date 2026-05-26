import { z } from 'zod';
import * as front from '../front-client.js';

export function registerMessageTools(server) {
  server.tool(
    'get_message',
    'Get a specific message by ID. Returns full message details including body, recipients, and metadata.',
    { message_id: z.string().describe('Message ID (e.g. msg_abc123)') },
    async ({ message_id }) => {
      const data = await front.get(`/messages/${message_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}
