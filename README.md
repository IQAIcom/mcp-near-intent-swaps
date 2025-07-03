# NEAR Intent Swaps MCP Server

An MCP server for NEAR intent swaps using the [Defuse Protocol one-click SDK](https://github.com/defuse-protocol/one-click-sdk-typescript). This server provides tools for cross-chain token swaps through NEAR's intent-based architecture.

## Features

- **GET_NEAR_SWAP_QUOTE**: Get quotes for cross-chain token swaps
- **EXECUTE_NEAR_SWAP**: Execute swaps by submitting deposit transactions  
- **CHECK_NEAR_SWAP_STATUS**: Check the status of swap executions

## Prerequisites

- Node.js >= 16
- pnpm >= 8
- A JWT token from the Defuse Protocol (for authentication)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd mcp-near-intent-swaps

# Install dependencies
pnpm install

# Build the server
pnpm build
```

## Configuration

Set the following environment variables:

```bash
# Optional: Custom API endpoint (defaults to https://1click.chaindefuser.com)
export NEAR_SWAP_API_URL="https://1click.chaindefuser.com"

# Required: JWT token for authentication
export NEAR_SWAP_JWT_TOKEN="your-jwt-token-here"
```

## Usage

### Running the Server

```bash
# Start the MCP server
pnpm start

# Or run directly
node dist/index.js
```

### Available Tools

#### 1. GET_NEAR_SWAP_QUOTE

Get a quote for a cross-chain token swap.

**Parameters:**
- `swapType`: "EXACT_INPUT" | "EXACT_OUTPUT" - Type of swap
- `originAsset`: string - Origin asset identifier (e.g., 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near')
- `destinationAsset`: string - Destination asset identifier
- `amount`: string - Amount to swap (in base units)
- `recipient`: string - Recipient address
- `recipientType`: "ORIGIN_CHAIN" | "DESTINATION_CHAIN" - Chain type for recipient
- `refundTo?`: string - Refund address (optional)
- `refundType?`: "ORIGIN_CHAIN" | "DESTINATION_CHAIN" - Chain type for refund (optional)
- `slippageTolerance?`: number - Slippage tolerance in basis points (default: 100 = 1%)
- `dry?`: boolean - Whether this is a dry run (default: true)
- `depositType?`: "ORIGIN_CHAIN" | "DESTINATION_CHAIN" - Deposit type (optional)

#### 2. EXECUTE_NEAR_SWAP

Execute a swap by submitting a deposit transaction.

**Parameters:**
- `txHash`: string - Transaction hash of the deposit transaction
- `depositAddress`: string - Deposit address for the swap

#### 3. CHECK_NEAR_SWAP_STATUS

Check the execution status of a swap.

**Parameters:**
- `depositAddress`: string - Deposit address to check status for

## Example Usage

### Getting a Quote

```json
{
  "swapType": "EXACT_INPUT",
  "originAsset": "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near",
  "destinationAsset": "nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near",
  "amount": "1000",
  "recipient": "13QkxhNMrTPxoCkRdYdJ65tFuwXPhL5gLS2Z5Nr6gjRK",
  "recipientType": "DESTINATION_CHAIN",
  "refundTo": "0x2527D02599Ba641c19FEa793cD0F167589a0f10D",
  "refundType": "ORIGIN_CHAIN",
  "slippageTolerance": 100,
  "dry": true
}
```

### Executing a Swap

```json
{
  "txHash": "0x1234567890abcdef...",
  "depositAddress": "0xabcdef1234567890..."
}
```

### Checking Status

```json
{
  "depositAddress": "0xabcdef1234567890..."
}
```

## Authentication

This server requires a JWT token for authentication with the Defuse Protocol API. Make sure to set the `NEAR_SWAP_JWT_TOKEN` environment variable before running the server.

## Error Handling

The server provides detailed error messages for common issues:
- Missing JWT token
- Invalid request parameters
- API connection errors
- Invalid asset identifiers

## Development

```bash
# Watch for changes during development
pnpm watch

# Format code
pnpm format

# Lint code
pnpm lint
```

## License

ISC - See LICENSE for details.

## Related Resources

- [Defuse Protocol one-click SDK](https://github.com/defuse-protocol/one-click-sdk-typescript)
- [MCP Specification](https://modelcontextprotocol.io)
- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
