#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { nearSwapExecuteTool } from "./tools/near-swap-execute.js";
import { nearSwapQuoteTool } from "./tools/near-swap-quote.js";
import { nearSwapStatusTool } from "./tools/near-swap-status.js";

async function main() {
	console.log("Initializing NEAR Intent Swaps MCP Server...");

	const server = new FastMCP({
		name: "NEAR Intent Swaps MCP Server",
		version: "0.0.1",
	});

	// Add all NEAR swap tools
	server.addTool(nearSwapQuoteTool);
	server.addTool(nearSwapExecuteTool);
	server.addTool(nearSwapStatusTool);

	try {
		await server.start({
			transportType: "stdio",
		});
		console.log(
			"✅ NEAR Intent Swaps MCP Server started successfully over stdio.",
		);
		console.log("   You can now connect to it using an MCP client.");
		console.log("   Available tools:");
		console.log(
			"   - GET_NEAR_SWAP_QUOTE: Get quotes for cross-chain token swaps",
		);
		console.log(
			"   - EXECUTE_NEAR_SWAP: Execute swaps by submitting deposit transactions",
		);
		console.log(
			"   - CHECK_NEAR_SWAP_STATUS: Check the status of swap executions",
		);
		console.log("");
		console.log(
			"   Make sure to set the NEAR_SWAP_JWT_TOKEN environment variable for authentication.",
		);
	} catch (error) {
		console.error("❌ Failed to start NEAR Intent Swaps MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(
		"❌ An unexpected error occurred in the NEAR Intent Swaps MCP Server:",
		error,
	);
	process.exit(1);
});
