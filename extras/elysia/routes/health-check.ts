import Elysia from "elysia";
import { core } from "~/core";

export const healthCheck = new Elysia({
	aot: false,
})
	.use(core)
	.get(
		"/health-check",
		(c) => {
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
		},
		{
			detail: {
				summary: "Health Check",
			},
		},
	);
