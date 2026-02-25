import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry.js";
import "./paths.js";

export const openapiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: "3.0.3",
  info: {
    title: "Timplan API",
    description: "API documentation for the Timplan project.",
    version: "0.1.0",
  },
});

export function getOpenApiDocument() {
  return openapiDocument;
}
