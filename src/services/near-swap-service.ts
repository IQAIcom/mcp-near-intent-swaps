import {
	type GetExecutionStatusResponse,
	OneClickService,
	OpenAPI,
	type QuoteRequest,
	type SubmitDepositTxResponse,
} from "@defuse-protocol/one-click-sdk-typescript";
import { config } from "../lib/config.js";

export interface QuoteParams {
	swapType: "EXACT_INPUT" | "EXACT_OUTPUT";
	originAsset: string;
	destinationAsset: string;
	amount: string;
	recipient: string;
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
		const quoteRequest: Partial<QuoteRequest> & {
			originAsset: string;
			destinationAsset: string;
			amount: string;
			recipient: string;
		} = {
			dry: params.dry ?? true,
			swapType: params.swapType as QuoteRequest["swapType"],
			slippageTolerance: params.slippageTolerance ?? 100, // 1% default
			originAsset: params.originAsset,
			depositType: params.depositType as QuoteRequest["depositType"],
			destinationAsset: params.destinationAsset,
			amount: params.amount,
			recipient: params.recipient,
			recipientType: params.recipientType as QuoteRequest["recipientType"],
			deadline:
				params.deadline ?? new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
			...(params.refundTo && { refundTo: params.refundTo }),
			...(params.refundType && {
				refundType: params.refundType as QuoteRequest["refundType"],
			}),
			...(params.referral && { referral: params.referral }),
			...(params.quoteWaitingTimeMs && {
				quoteWaitingTimeMs: params.quoteWaitingTimeMs,
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
}
