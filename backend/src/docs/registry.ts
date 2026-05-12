import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  BatchUpsertCardsSchema,
  CardSchema,
  CardUpdateSchema,
  CreateCardSchema,
  DateDataSchema,
  DeckSchema,
  UpsertCardSchema,
} from "./schemas.js";

export const registry = new OpenAPIRegistry();

registry.register("Card", CardSchema);
registry.register("CreateCard", CreateCardSchema);
registry.register("CardUpdate", CardUpdateSchema);
registry.register("UpsertCard", UpsertCardSchema);
registry.register("BatchUpsertCards", BatchUpsertCardsSchema);
registry.register("Deck", DeckSchema);
registry.register("DateData", DateDataSchema);
