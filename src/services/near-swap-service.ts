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
	recipientType: "ORIGIN_CHAIN" | "DESTINATION_CHAIN";
	refundTo?: string;
	refundType?: "ORIGIN_CHAIN" | "DESTINATION_CHAIN";
	slippageTolerance?: number; // basis points (100 = 1%)
	dry?: boolean;
	depositType?: "ORIGIN_CHAIN" | "DESTINATION_CHAIN";
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
			...(params.refundTo && { refundTo: params.refundTo }),
			...(params.refundType && {
				refundType: params.refundType as QuoteRequest["refundType"],
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
