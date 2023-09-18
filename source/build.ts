import { getTargetEnv } from "@aerofoil/aerofoil-core/util/getTargetEnv";
import { buildWranglerToml } from "@aerofoil/af-ext-cloudflare/buildWranglerToml";
import { Type as t } from "@sinclair/typebox";
import type { ReadonlyDeep } from "type-fest";

//* import.meta.url is part of node types
//* this deployment is for cloudflare workers so the tsconfig reflects that
//* however this build file is run by node so we just override the type here
interface ImportMeta {
	url: string;
}

const envValidation = t.Object({});
const env = await getTargetEnv<typeof envValidation>(
	(import.meta as ImportMeta).url,
	envValidation,
);

const vars = {
	...env,
};

export type EnvType = ReadonlyDeep<typeof vars>;

await buildWranglerToml([{ vars }]);
