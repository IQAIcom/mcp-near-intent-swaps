import dedent from "dedent";
import { z } from "zod";
import { NearSwapService } from "../services/near-swap-service.js";

const statusToolParams = z.object({
	depositAddress: z
		.string()
		.min(1)
		.describe("Deposit address to check the execution status for"),
});

type StatusToolParams = z.infer<typeof statusToolParams>;

export const nearSwapStatusTool = {
	name: "CHECK_NEAR_SWAP_STATUS",
	description: "Check the execution status of a NEAR intent swap",
	parameters: statusToolParams,
	execute: async (params: StatusToolParams) => {
		const nearSwapService = new NearSwapService();

		try {
			const status = await nearSwapService.getExecutionStatus(
				params.depositAddress,
			);

			return dedent`
				NEAR Swap Status:

				Deposit Address: ${params.depositAddress}

				Status Response:
				${JSON.stringify(status, null, 2)}
			`;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("JWT") || error.message.includes("token")) {
					return "Error: JWT token is required for this operation. Please set the NEAR_SWAP_JWT_TOKEN environment variable.";
				}
				return `Error checking swap status: ${error.message}`;
			}
			return "An unknown error occurred while checking the swap status";
		}
	},
} as const;
