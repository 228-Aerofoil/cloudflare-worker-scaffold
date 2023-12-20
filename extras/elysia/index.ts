import type { Bindings } from "~/bindings";
import { core } from "~/core";
import { healthCheck } from "~/routes/health-check";

const app = core.use(healthCheck);

export type App = typeof app;

export default {
	fetch(req: Request, env: Bindings) {
		(req as Request & { env: Bindings }).env = env;
		return app.handle(req);
	},
};
