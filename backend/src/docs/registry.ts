import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  CardSchema,
  DeckSchema,
  MediaSchema,
} from "./schemas.js";

export const registry = new OpenAPIRegistry();

registry.register("Media", MediaSchema);
registry.register("Card", CardSchema);
registry.register("Deck", DeckSchema);
