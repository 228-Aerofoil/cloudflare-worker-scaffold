import { Hono } from "hono";
import { BaseRouterType } from "~/index";

export const healthCheck = new Hono<BaseRouterType>().get(
	"/health-check",
	(c) =>
		c.jsonT({
			req: c.get("reqId"),
			meta: {
				colo: c.req.raw.cf?.colo as string,
				country: c.req.raw.cf?.country as string,
				city: c.req.raw.cf?.city as string,
				region: c.req.raw.cf?.region as string,
				regionCode: c.req.raw.cf?.regionCode as string,
				httpProtocol: c.req.raw.cf?.httpProtocol as string,
			},
		})
);
