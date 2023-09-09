import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { customAlphabet } from "nanoid";
import { healthCheck } from "~/routes/health-check";
import type { Bindings } from "~/bindings";
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

export type BaseRouterType = {
	Bindings: Bindings;
	Variables: {
		reqId: string;
	};
};

const routes = new Hono<BaseRouterType>()
	.use("*", prettyJSON())
	.use("*", async (c, next) => {
		c.set("reqId", nanoid());
		await next();
	})
	.route("/", healthCheck);

export type AppType = typeof routes;
export default routes;
