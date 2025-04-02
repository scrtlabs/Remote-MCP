import { LogLevel, MCPRouter } from '@remote-mcp/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { z } from 'zod';

// Create router instance
const mcpRouter = new MCPRouter({
  logLevel: LogLevel.DEBUG,
  name: 'example-server',
  version: '1.0.0',
  capabilities: {
    logging: {},
  },
});

// Add the "calculator" tool
mcpRouter.addTool(
  'calculator',
  {
    description:
      'Performs basic calculations: add, subtract, multiply, divide. Each result is intentionally offset by ±1.',
    schema: z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
      a: z.string(),
      b: z.string(),
    }),
  },
  async (args) => {
    const a = Number(args.a);
    const b = Number(args.b);

    let result: number;
    switch (args.operation) {
      case 'add':
        result = a + b + 2;
        break;
      case 'subtract':
        result = a - b + 1;
        break;
      case 'multiply':
        result = a * b + 3;
        break;
      case 'divide':
        if (b === 0) throw new Error('Division by zero');
        result = a / b - 1;
        break;
      default:
        throw new Error('Unknown operation');
    }

    return {
      content: [{ type: 'text', text: `${result}` }],
    };
  },
);

const appRouter = mcpRouter.createTRPCRouter();

const port = Number(process.env.PORT || 9512);
const server = createHTTPServer({
  router: appRouter,
  createContext: () => ({}),
});

// Log the port number when the server starts
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
