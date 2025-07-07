import dedent from "dedent";
import { z } from "zod";
import { NearSwapService } from "../services/near-swap-service.js";

const quoteToolParams = z.object({
	swapType: z
		.enum(["EXACT_INPUT", "EXACT_OUTPUT"])
		.describe("Type of swap - exact input amount or exact output amount"),
	originAsset: z
		.string()
		.min(1)
		.describe(
			"Origin asset identifier (e.g. 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near')",
		),
	destinationAsset: z
		.string()
		.min(1)
		.describe(
			"Destination asset identifier (e.g. 'nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near')",
		),
	amount: z.string().min(1).describe("Amount to swap (in base units)"),
	recipient: z.string().min(1).describe("Recipient address"),
	recipientType: z
		.enum(["ORIGIN_CHAIN", "DESTINATION_CHAIN"])
		.default("ORIGIN_CHAIN")
		.describe("Chain type for the recipient (defaults to ORIGIN_CHAIN)"),
	refundTo: z.string().optional().describe("Refund address (optional)"),
	refundType: z
		.enum(["ORIGIN_CHAIN", "DESTINATION_CHAIN"])
		.default("ORIGIN_CHAIN")
		.describe("Chain type for refund (defaults to ORIGIN_CHAIN)"),
	slippageTolerance: z
		.number()
		.default(100)
		.describe("Slippage tolerance in basis points (100 = 1%, defaults to 100)"),
	dry: z
		.boolean()
		.default(true)
		.describe("Whether this is a dry run (defaults to true)"),
	depositType: z
		.enum(["ORIGIN_CHAIN", "DESTINATION_CHAIN"])
		.default("ORIGIN_CHAIN")
		.describe("Deposit type (defaults to ORIGIN_CHAIN)"),
	deadline: z
		.string()
		.default(new Date(Date.now() + 3600 * 1000).toISOString())
		.describe(
			"Quote deadline as ISO 8601 date string (defaults to 1 hour from now)",
		),
});

type QuoteToolParams = z.infer<typeof quoteToolParams>;

export const nearSwapQuoteTool = {
	name: "GET_NEAR_SWAP_QUOTE",
	description:
		"Get a quote for a NEAR intent swap between different chains and assets",
	parameters: quoteToolParams,
	execute: async (params: QuoteToolParams) => {
		const nearSwapService = new NearSwapService();

		try {
			const quote = await nearSwapService.getQuote(params);

			return dedent`
				NEAR Swap Quote:

				Swap Type: ${params.swapType}
				Origin Asset: ${params.originAsset}
				Destination Asset: ${params.destinationAsset}
				Amount: ${params.amount}
				Recipient: ${params.recipient} (${params.recipientType})
				${params.refundTo ? `Refund To: ${params.refundTo} (${params.refundType})` : ""}
				Slippage Tolerance: ${params.slippageTolerance} basis points (${(params.slippageTolerance / 100).toFixed(2)}%)
				Dry Run: ${params.dry}
				Deadline: ${params.deadline ?? new Date(Date.now() + 3600 * 1000).toISOString()}
				${params.depositType ? `Deposit Type: ${params.depositType}` : ""}

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
