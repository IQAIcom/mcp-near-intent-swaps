import dedent from "dedent";
import { z } from "zod";
import {
	NearSwapService,
	type QuoteParams,
} from "../services/near-swap-service.js";

const fullQuoteToolParams = z.object({
	swapType: z
		.enum(["EXACT_INPUT", "EXACT_OUTPUT"])
		.default("EXACT_INPUT")
		.describe(
			"(Optional, defaults to EXACT_INPUT) Whether to use the amount as the output or the input for the basis of the swap: EXACT_INPUT - request output amount for exact input, EXACT_OUTPUT - request output amount for exact output. The refundTo address will always receive excess tokens back even after the swap is complete.",
		),
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
			"Amount to swap as the base amount (can be switched to exact input/output using the dedicated flag), denoted in the smallest unit of the specified currency (e.g., wei for ETH)",
		),
	recipient: z
		.string()
		.min(1)
		.describe("Recipient address. The format should match recipientType."),
	recipientType: z
		.enum(["DESTINATION_CHAIN", "INTENTS"])
		.default("DESTINATION_CHAIN")
		.describe(
			"(Optional, defaults to DESTINATION_CHAIN) Type of recipient address: DESTINATION_CHAIN - assets will be transferred to chain of destinationAsset, INTENTS - assets will be transferred to account inside intents",
		),
	refundTo: z
		.string()
		.optional()
		.describe("(Optional) Address for user refund"),
	refundType: z
		.enum(["ORIGIN_CHAIN", "INTENTS"])
		.default("ORIGIN_CHAIN")
		.describe(
			"(Optional, defaults to ORIGIN_CHAIN) Type of refund address: ORIGIN_CHAIN - assets will be refunded to refundTo address on the origin chain, INTENTS - assets will be refunded to refundTo intents account",
		),
	slippageTolerance: z
		.number()
		.default(100)
		.describe(
			"(Optional, defaults to 100) Slippage tolerance for the swap. This value is in basis points (1/100th of a percent), e.g. 100 for 1% slippage.",
		),
	dry: z
		.boolean()
		.default(false)
		.describe(
			"(Optional, defaults to false) Flag indicating whether this is a dry run request. If true, the response will NOT contain the following fields: depositAddress, timeWhenInactive, deadline.",
		),
	depositType: z
		.enum(["ORIGIN_CHAIN", "INTENTS"])
		.default("ORIGIN_CHAIN")
		.describe(
			"(Optional, defaults to ORIGIN_CHAIN) Type of the deposit address: ORIGIN_CHAIN - deposit address on the origin chain, INTENTS - account ID inside near intents to which you should transfer assets inside intents",
		),
	deadline: z
		.string()
		.default(new Date(Date.now() + 3600 * 1000).toISOString())
		.describe(
			"(Optional, defaults to 1 hour from now) Timestamp in ISO format, that identifies when user refund will begin if the swap isn't completed by then. It needs to exceed the time required for the deposit tx to be minted, e.g. for Bitcoin it might require ~1h depending on the gas fees paid.",
		),
	referral: z
		.string()
		.optional()
		.describe(
			"(Optional) Referral identifier (lower case only). It will be reflected in the on-chain data and displayed on public analytics platforms.",
		),
	quoteWaitingTimeMs: z
		.number()
		.default(3000)
		.describe(
			"(Optional, defaults to 3000) Time in milliseconds user is willing to wait for quote from relay",
		),
});

type FullQuoteToolParams = z.infer<typeof fullQuoteToolParams>;

export const nearSwapFullQuoteTool = {
	name: "GET_NEAR_SWAP_FULL_QUOTE",
	description:
		"[STEP 2] Get a full quote with deposit address for a NEAR intent swap. This requires recipient and refund addresses and returns a unique deposit address where users can send their funds to initiate the swap. Use this when users are ready to proceed with the swap after checking the simple quote.",
	parameters: fullQuoteToolParams,
	execute: async (params: FullQuoteToolParams) => {
		const nearSwapService = new NearSwapService();

		try {
			const quote = await nearSwapService.getQuote(params as QuoteParams);

			return dedent`
				NEAR Swap Full Quote:

				Swap Type: ${params.swapType}
				Origin Asset: ${params.originAsset}
				Destination Asset: ${params.destinationAsset}
				Amount: ${params.amount}
				Recipient: ${params.recipient} (${params.recipientType})
				${params.refundTo ? `Refund To: ${params.refundTo} (${params.refundType})` : ""}
				Slippage Tolerance: ${params.slippageTolerance} basis points (${(params.slippageTolerance / 100).toFixed(2)}%)
				Dry Run: ${params.dry}
				Deadline: ${params.deadline}
				Deposit Type: ${params.depositType}
				${params.referral ? `Referral: ${params.referral}` : ""}
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
