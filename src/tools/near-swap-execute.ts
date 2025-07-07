import dedent from "dedent";
import { z } from "zod";
import { NearSwapService } from "../services/near-swap-service.js";

const executeToolParams = z.object({
	txHash: z
		.string()
		.min(1)
		.describe(
			"Transaction hash of your deposit transaction that was sent to the deposit address from the quote",
		),
	depositAddress: z
		.string()
		.min(1)
		.describe(
			"The deposit address that was provided in the quote response and to which the deposit transaction was sent",
		),
});

type ExecuteToolParams = z.infer<typeof executeToolParams>;

export const nearSwapExecuteTool = {
	name: "EXECUTE_NEAR_SWAP",
	description:
		"Submit a deposit transaction hash to notify the 1Click service that funds have been sent. This is an optional step that can speed up swap processing by allowing the system to preemptively verify the deposit, rather than waiting for automatic detection.",
	parameters: executeToolParams,
	execute: async (params: ExecuteToolParams) => {
		const nearSwapService = new NearSwapService();

		try {
			const result = await nearSwapService.executeSwap(params);

			return dedent`
				NEAR Swap Execution Notification:

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
