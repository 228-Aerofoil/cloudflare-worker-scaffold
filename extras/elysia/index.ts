//@ts-expect-error
// eslint-disable-next-line no-unused-vars
import { Elysia } from "elysia";
import { core } from "~/core";
import { healthCheck } from "~/routes/health-check";
import type { Bindings } from "~/bindings";

const app = core.use(healthCheck);

export type App = typeof app;

export default {
	fetch(req: Request, env: Bindings) {
		(req as Request & { env: Bindings }).env = env;
		return app.handle(req);
	},
};
