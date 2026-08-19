import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const TUTU_MCP_URL = import.meta.env.TUTU_MCP_URL || 'https://mcp.tutu.ru/mcp';

type TutuTool = {
	name: string;
	title?: string;
	description?: string;
	inputSchema: Record<string, unknown>;
};

class TutuMcpClient {
	private client?: Client;
	private transport?: StreamableHTTPClientTransport;
	private toolsPromise?: Promise<TutuTool[]>;

	private async ensureClient() {
		if (this.client && this.transport) {
			return this.client;
		}

		const client = new Client({
			name: 'tutu-ai-agent',
			version: '0.0.1'
		});
		const transport = new StreamableHTTPClientTransport(new URL(TUTU_MCP_URL));

		await client.connect(transport);

		this.client = client;
		this.transport = transport;

		return client;
	}

	async listTools() {
		if (!this.toolsPromise) {
			this.toolsPromise = this.ensureClient()
				.then((client) => client.listTools())
				.then((result) => result.tools as TutuTool[])
				.catch((error) => {
					this.toolsPromise = undefined;
					this.client = undefined;
					this.transport = undefined;
					throw error;
				});
		}

		return this.toolsPromise;
	}

	async callTool(name: string, args: Record<string, unknown>) {
		const client = await this.ensureClient();
		return client.callTool({
			name,
			arguments: args
		});
	}
}

export const tutuMcpClient = new TutuMcpClient();
