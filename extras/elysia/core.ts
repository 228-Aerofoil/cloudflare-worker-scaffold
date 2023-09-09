import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { customAlphabet } from "nanoid";
import type { Bindings } from "~/bindings";
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

export const core = new Elysia({
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
					version: "1.0.0",
				},
			},
		}),
	);
