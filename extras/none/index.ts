import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

export default {
	fetch(request: Request) {
		const url = new URL(request.url);
		const reqId = nanoid();

		switch (url.pathname) {
			case "/health-check":
				return new Response(
					JSON.stringify({
						req: reqId,
						meta: {
							colo: request.cf?.colo,
							country: request.cf?.country,
							city: request.cf?.city,
							region: request.cf?.region,
							regionCode: request.cf?.regionCode,
							httpProtocol: request.cf?.httpProtocol,
						},
					}),
					{
						headers: {
							"content-type": "application/json",
						},
					},
				);

			default:
				return new Response("Not found", {
					status: 404,
				});
		}
	},
};
