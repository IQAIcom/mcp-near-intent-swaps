import dedent from "dedent";
import { z } from "zod";
import { NearSwapService } from "../services/near-swap-service.js";

const tokensToolParams = z.object({});

type TokensToolParams = z.infer<typeof tokensToolParams>;

export const nearSwapTokensTool = {
	name: "GET_NEAR_SWAP_TOKENS",
	description:
		"[DISCOVERY] Get a list of tokens currently supported by the 1Click API for NEAR Intents. Returns token metadata including blockchain, contract address, current USD price, symbol, decimals, and price update timestamp. Use this to help users discover available tokens before requesting quotes.",
	parameters: tokensToolParams,
	execute: async (_: TokensToolParams) => {
		const nearSwapService = new NearSwapService();

		try {
			const tokens = await nearSwapService.getSupportedTokens();

			return dedent`
				NEAR Swap Supported Tokens:

				${JSON.stringify(tokens, null, 2)}
			`;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("JWT") || error.message.includes("token")) {
					return "Error: JWT token is required for this operation. Please set the NEAR_SWAP_JWT_TOKEN environment variable.";
				}
				return `Error getting supported tokens: ${error.message}`;
			}
			return "An unknown error occurred while getting supported tokens";
		}
	},
} as const;
