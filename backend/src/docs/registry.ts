import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  BatchUpsertCardsSchema,
  CardProgressSchema,
  CardSchema,
  CardUpdateSchema,
  CreateCardSchema,
  UpsertCardSchema,
} from "../validation/cardSchemas.js";
import {
  CreateDateDataSchema,
  DateDataSchema,
  DateDataUpdateSchema,
} from "../validation/dateDataSchemas.js";
import {
  CreateDeckSchema,
  DeckSchema,
  DeckUpdateSchema,
} from "../validation/deckSchemas.js";
import {
  CreateUserSchema,
  UserSchema,
  UserUpdateSchema,
} from "../validation/userSchemas.js";

export const registry = new OpenAPIRegistry();

registry.register("Card", CardSchema);
registry.register("CardProgress", CardProgressSchema);
registry.register("CreateCard", CreateCardSchema);
registry.register("CardUpdate", CardUpdateSchema);
registry.register("UpsertCard", UpsertCardSchema);
registry.register("BatchUpsertCards", BatchUpsertCardsSchema);
registry.register("Deck", DeckSchema);
registry.register("CreateDeck", CreateDeckSchema);
registry.register("DeckUpdate", DeckUpdateSchema);
registry.register("User", UserSchema);
registry.register("CreateUser", CreateUserSchema);
registry.register("UserUpdate", UserUpdateSchema);
registry.register("DateData", DateDataSchema);
registry.register("CreateDateData", CreateDateDataSchema);
registry.register("DateDataUpdate", DateDataUpdateSchema);
