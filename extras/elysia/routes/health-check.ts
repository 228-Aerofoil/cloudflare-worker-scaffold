import type { context } from "~/index";

export function healthCheck(c: context) {
	return {
		req: c.reqId,
		meta: {
			colo: c.request.cf?.colo as string,
			country: c.request.cf?.country as string,
			city: c.request.cf?.city as string,
			region: c.request.cf?.region as string,
			regionCode: c.request.cf?.regionCode as string,
			httpProtocol: c.request.cf?.httpProtocol as string,
		},
	};
}

healthCheck.schema = {
	detail: {
		summary: "Health Check",
	},
};
