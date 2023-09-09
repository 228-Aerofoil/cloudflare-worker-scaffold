import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { customAlphabet } from "nanoid";
import { healthCheck } from "~/routes/health-check";
import type { Bindings } from "~/bindings";
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

const core = new Elysia({
	aot: false,
})
	.derive<{ env: Bindings; reqId: string }>((req) => ({
		env: (req.request as Request & { env: Bindings }).env,
		reqId: nanoid(),
	}))
	.use(
		swagger({
			documentation: {
				info: {
					title: "Name",
					description: "Description",
				},
			},
		}),
	);

export type context = Parameters<Parameters<(typeof core)["all"]>[1]>[0];

export const app = core.get("/health-check", healthCheck, healthCheck.schema);

export default {
	fetch(req: Request, env: Bindings) {
		(req as Request & { env: Bindings }).env = env;
		return app.handle(req);
	},
};
