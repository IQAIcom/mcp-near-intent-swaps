import dedent from "dedent";
import { z } from "zod";
import { NearSwapService } from "../services/near-swap-service.js";

const executeToolParams = z.object({
	txHash: z
		.string()
		.min(1)
		.describe("Transaction hash of the deposit transaction"),
	depositAddress: z.string().min(1).describe("Deposit address for the swap"),
});

type ExecuteToolParams = z.infer<typeof executeToolParams>;

export const nearSwapExecuteTool = {
	name: "EXECUTE_NEAR_SWAP",
	description: "Execute a NEAR intent swap by submitting a deposit transaction",
	parameters: executeToolParams,
	execute: async (params: ExecuteToolParams) => {
		const nearSwapService = new NearSwapService();

		try {
			const result = await nearSwapService.executeSwap(params);

			return dedent`
				NEAR Swap Execution:

				Transaction Hash: ${params.txHash}
				Deposit Address: ${params.depositAddress}

				Execution Result:
				${JSON.stringify(result, null, 2)}
			`;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("JWT") || error.message.includes("token")) {
					return "Error: JWT token is required for this operation. Please set the NEAR_SWAP_JWT_TOKEN environment variable.";
				}
				return `Error executing swap: ${error.message}`;
			}
			return "An unknown error occurred while executing the swap";
		}
	},
} as const;
