import {
	type GetExecutionStatusResponse,
	OneClickService,
	OpenAPI,
	type QuoteRequest,
	type SubmitDepositTxResponse,
} from "@defuse-protocol/one-click-sdk-typescript";
import { config } from "../lib/config.js";

// Dummy addresses for each blockchain when dry=true
const DUMMY_ADDRESSES = {
	near: "dummy.near",
	eth: "0x0000000000000000000000000000000000000000",
	btc: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
	sol: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
	arb: "0x0000000000000000000000000000000000000000",
	doge: "DQUyqE96EgXjHn46K9GsF4Lp7jS7wc4VBz",
	xrp: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
	gnosis: "0x0000000000000000000000000000000000000000",
	bera: "0x0000000000000000000000000000000000000000",
	base: "0x0000000000000000000000000000000000000000",
	tron: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
	zec: "t1Ww3oCEsYqK879WpKTpgKa4jWjYkPjK2Th",
} as const;

// Function to extract blockchain from asset ID
function getBlockchainFromAssetId(assetId: string): string {
	// Asset IDs are in format: nep141:blockchain-address.omft.near or nep141:blockchain.omft.near
	const parts = assetId.split(":");
	if (parts.length !== 2) return "near"; // Default to near

	const afterColon = parts[1];

	// Check if it's a cross-chain token (ends with .omft.near)
	if (afterColon.endsWith(".omft.near")) {
		// Extract blockchain from the beginning (before first - or .)
		const blockchainPart = afterColon.split("-")[0].split(".")[0];
		return blockchainPart;
	}

	// Otherwise, it's a native NEAR token
	return "near";
}

// Function to get dummy address for blockchain
function getDummyAddress(blockchain: string): string {
	return (
		DUMMY_ADDRESSES[blockchain as keyof typeof DUMMY_ADDRESSES] ||
		DUMMY_ADDRESSES.near
	);
}

export interface QuoteParams {
	swapType: "EXACT_INPUT" | "EXACT_OUTPUT";
	originAsset: string;
	destinationAsset: string;
	amount: string;
	recipient?: string; // Made optional - will be auto-filled when dry=true
	recipientType: "DESTINATION_CHAIN" | "INTENTS";
	refundTo?: string;
	refundType?: "ORIGIN_CHAIN" | "INTENTS";
	slippageTolerance?: number; // basis points (100 = 1%)
	dry?: boolean;
	depositType?: "ORIGIN_CHAIN" | "INTENTS";
	deadline?: string; // ISO 8601 date string
	referral?: string;
	quoteWaitingTimeMs?: number;
}

export interface SwapExecution {
	txHash: string;
	depositAddress: string;
}

export class NearSwapService {
	constructor() {
		// Configure the one-click SDK
		OpenAPI.BASE = config.nearSwapApi.baseUrl;
		if (config.nearSwapApi.jwtToken) {
			OpenAPI.TOKEN = config.nearSwapApi.jwtToken;
		}
	}

	async getQuote(params: QuoteParams): Promise<unknown> {
		// Validate required fields for non-dry runs
		if (!params.dry && !params.recipient) {
			throw new Error("recipient address is required when dry=false");
		}

		// Process params and set dummy addresses when dry=true
		const processedParams = { ...params };

		// Handle recipient address
		if (!processedParams.recipient) {
			if (params.dry) {
				const destinationBlockchain = getBlockchainFromAssetId(
					params.destinationAsset,
				);
				processedParams.recipient = getDummyAddress(destinationBlockchain);
			} else {
				throw new Error("recipient address is required when dry=false");
			}
		}

		// Handle refundTo address
		if (!processedParams.refundTo && params.dry) {
			const originBlockchain = getBlockchainFromAssetId(params.originAsset);
			processedParams.refundTo = getDummyAddress(originBlockchain);
		}

		const quoteRequest: Partial<QuoteRequest> & {
			originAsset: string;
			destinationAsset: string;
			amount: string;
			recipient: string;
		} = {
			dry: processedParams.dry ?? true,
			swapType: processedParams.swapType as QuoteRequest["swapType"],
			slippageTolerance: processedParams.slippageTolerance ?? 100, // 1% default
			originAsset: processedParams.originAsset,
			depositType: processedParams.depositType as QuoteRequest["depositType"],
			destinationAsset: processedParams.destinationAsset,
			amount: processedParams.amount,
			recipient: processedParams.recipient,
			recipientType:
				processedParams.recipientType as QuoteRequest["recipientType"],
			deadline:
				processedParams.deadline ??
				new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
			...(processedParams.refundTo && { refundTo: processedParams.refundTo }),
			...(processedParams.refundType && {
				refundType: processedParams.refundType as QuoteRequest["refundType"],
			}),
			...(processedParams.referral && { referral: processedParams.referral }),
			...(processedParams.quoteWaitingTimeMs && {
				quoteWaitingTimeMs: processedParams.quoteWaitingTimeMs,
			}),
		};

		return await OneClickService.getQuote(quoteRequest as QuoteRequest);
	}

	async executeSwap(
		execution: SwapExecution,
	): Promise<SubmitDepositTxResponse> {
		return await OneClickService.submitDepositTx({
			txHash: execution.txHash,
			depositAddress: execution.depositAddress,
		});
	}

	async getExecutionStatus(
		depositAddress: string,
	): Promise<GetExecutionStatusResponse> {
		return await OneClickService.getExecutionStatus(depositAddress);
	}

	async getSupportedTokens(): Promise<unknown> {
		return await OneClickService.getTokens();
	}
}
