import dedent from "dedent";
import { z } from "zod";
import { NearSwapService } from "../services/near-swap-service.js";

const statusToolParams = z.object({
	depositAddress: z
		.string()
		.min(1)
		.describe(
			"The unique deposit address from the quote response - used to track and retrieve the current status of the swap",
		),
});

type StatusToolParams = z.infer<typeof statusToolParams>;

export const nearSwapStatusTool = {
	name: "CHECK_NEAR_SWAP_STATUS",
	description:
		"[STEP 5] Check the current execution status of a NEAR intent swap. Returns the swap state (PENDING_DEPOSIT, PROCESSING, SUCCESS, REFUNDED, FAILED, etc.) along with detailed transaction information. Use this to monitor swap progress after initiating the swap, and continue polling until the swap is complete.",
	parameters: statusToolParams,
	execute: async (params: StatusToolParams) => {
		const nearSwapService = new NearSwapService();

		try {
			const status = await nearSwapService.getExecutionStatus(
				params.depositAddress,
			);

			return dedent`
				NEAR Swap Status Check:

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
