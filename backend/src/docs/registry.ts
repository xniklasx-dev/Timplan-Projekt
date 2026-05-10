import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { CardSchema, DeckSchema, DateDataSchema } from "./schemas.js";

export const registry = new OpenAPIRegistry();

registry.register("Card", CardSchema);
registry.register("Deck", DeckSchema);
registry.register("DateData", DateDataSchema);
