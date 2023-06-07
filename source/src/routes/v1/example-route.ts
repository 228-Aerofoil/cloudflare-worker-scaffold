import { Hono } from "hono";
import { BaseRouterType } from "~/index";

export const exampleRoute = new Hono<BaseRouterType>().get(
  "/example-route",
  (c) => {
    return c.jsonT({
      example: "JSON data",
    });
  }
);
