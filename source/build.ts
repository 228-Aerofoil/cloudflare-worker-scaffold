import { getTargetEnv } from "@aerofoil/aerofoil-core/util/getTargetEnv";
import { buildWranglerToml } from "@aerofoil/af-ext-cloudflare/buildWranglerToml";
import { z } from "zod";
import type { ReadonlyDeep } from "type-fest";

//* import.meta.url is part of node types
//* this deployment is for cloudflare workers so the tsconfig reflects that
//* however this build file is run by node so we just override the type here
interface ImportMeta {
	url: string;
}

const envValidation = z.object({});
const env = await getTargetEnv((import.meta as ImportMeta).url, envValidation);

const vars = {
	...env,
};

export type EnvType = ReadonlyDeep<typeof vars>;

await buildWranglerToml([{ vars }]);
