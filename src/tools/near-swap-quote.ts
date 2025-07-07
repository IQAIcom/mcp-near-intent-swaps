import dedent from "dedent";
import { z } from "zod";
import { NearSwapService } from "../services/near-swap-service.js";

const simpleQuoteToolParams = z.object({
	originAsset: z
		.string()
		.min(1)
		.describe(
			"ID of the origin asset (e.g. 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near')",
		),
	destinationAsset: z
		.string()
		.min(1)
		.describe(
			"ID of the destination asset (e.g. 'nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near')",
		),
	amount: z
		.string()
		.min(1)
		.describe(
			"Amount to swap as the base amount, denoted in the smallest unit of the specified currency (e.g., wei for ETH)",
		),
	swapType: z
		.enum(["EXACT_INPUT", "EXACT_OUTPUT"])
		.default("EXACT_INPUT")
		.describe(
			"(Optional, defaults to EXACT_INPUT) Whether to use the amount as input or output for the swap calculation",
		),
	slippageTolerance: z
		.number()
		.default(100)
		.describe(
			"(Optional, defaults to 100) Slippage tolerance in basis points (100 = 1%)",
		),
	quoteWaitingTimeMs: z
		.number()
		.default(3000)
		.describe(
			"(Optional, defaults to 3000) Time in milliseconds to wait for quote from relay",
		),
});

type SimpleQuoteToolParams = z.infer<typeof simpleQuoteToolParams>;

export const nearSwapSimpleQuoteTool = {
	name: "GET_NEAR_SWAP_SIMPLE_QUOTE",
	description:
		"Get a simple quote for a NEAR intent swap between different chains and assets. This is a dry run that doesn't require any addresses and provides basic swap information.",
	parameters: simpleQuoteToolParams,
	execute: async (params: SimpleQuoteToolParams) => {
		const nearSwapService = new NearSwapService();

		try {
			const quote = await nearSwapService.getQuote({
				...params,
				dry: true,
				recipientType: "DESTINATION_CHAIN",
				refundType: "ORIGIN_CHAIN",
				depositType: "ORIGIN_CHAIN",
			});

			return dedent`
				NEAR Swap Simple Quote:

				${params.originAsset} → ${params.destinationAsset}
				Amount: ${params.amount}
				Swap Type: ${params.swapType}
				Slippage Tolerance: ${params.slippageTolerance} basis points (${(params.slippageTolerance / 100).toFixed(2)}%)
				Quote Waiting Time: ${params.quoteWaitingTimeMs}ms

				Quote Response:
				${JSON.stringify(quote, null, 2)}
			`;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("JWT") || error.message.includes("token")) {
					return "Error: JWT token is required for this operation. Please set the NEAR_SWAP_JWT_TOKEN environment variable.";
				}
				return `Error getting swap quote: ${error.message}`;
			}
			return "An unknown error occurred while getting the swap quote";
		}
	},
} as const;
