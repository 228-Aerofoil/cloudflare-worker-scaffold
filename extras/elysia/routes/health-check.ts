import type { context } from "~/index";

export const healthCheckSchema = {
	detail: {
		summary: "Health Check",
	},
};

export function healthCheck(c: context) {
	return {
		req: c.reqId,
		meta: {
			colo: c.request.cf?.colo,
			country: c.request.cf?.country,
			city: c.request.cf?.city,
			region: c.request.cf?.region,
			regionCode: c.request.cf?.regionCode,
			httpProtocol: c.request.cf?.httpProtocol,
		},
	};
}
