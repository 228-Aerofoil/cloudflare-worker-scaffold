import { buildWranglerToml } from "@aerofoil/af-ext-cloudflare/buildWranglerToml";
import { getTargetEnv } from "@aerofoil/aerofoil-core/util/getTargetEnv";
import type { ReadonlyDeep } from "type-fest";
import { z } from "zod";

const envValidation = z.object({});

const env = await getTargetEnv("test", envValidation);

export type EnvType = ReadonlyDeep<z.infer<typeof envValidation>>;

await buildWranglerToml([{ vars: env }]);
