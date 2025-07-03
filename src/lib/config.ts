export const config = {
	nearSwapApi: {
		baseUrl: process.env.NEAR_SWAP_API_URL || "https://1click.chaindefuser.com",
		jwtToken: process.env.NEAR_SWAP_JWT_TOKEN || "",
	},
};
