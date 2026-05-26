import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

import { registerConversationTools } from "./tools/conversations.js";
import { registerKnowledgeBaseTools } from "./tools/knowledge-base.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerTagTools } from "./tools/tags.js";
import { registerInboxTools } from "./tools/inboxes.js";
import { registerTeammateTools } from "./tools/teammates.js";
import { registerMessageTools } from "./tools/messages.js";
import { registerAnalyticsTools } from "./tools/analytics.js";
import { registerMeTools } from "./tools/me.js";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  // const authHeader = req.headers['authorization'];
  // const expectedToken = process.env.MCP_SECRET;

  // if (!expectedToken) {
  //   res.status(500).json({ error: 'MCP_SECRET environment variable is not set' });
  //   return;
  // }

  // if (authHeader !== `Bearer ${expectedToken}`) {
  //   res.status(401).json({ error: 'Unauthorized' });
  //   return;
  // }

  const server = new McpServer({ name: "front", version: "1.0.0" });

  registerConversationTools(server);
  registerKnowledgeBaseTools(server);
  registerContactTools(server);
  registerAccountTools(server);
  registerTagTools(server);
  registerInboxTools(server);
  registerTeammateTools(server);
  registerMessageTools(server);
  registerAnalyticsTools(server);
  registerMeTools(server);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MCP server listening on port ${PORT}`));
