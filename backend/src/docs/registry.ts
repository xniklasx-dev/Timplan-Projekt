////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  BatchDeleteCardsSchema,
  BatchUpsertCardsSchema,
  CardSchema,
  CardUpdateSchema,
  CreateCardSchema,
  UpsertCardSchema,
} from "../validation/cardSchemas.js";
import { CardProgressSchema } from "../validation/cardProgressSchemas.js";
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
  UserSchema,
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
} from "../validation/userSchemas.js";
import { registerAuthPaths } from "./authPaths.js";
import { registerCardPaths } from "./cardPaths.js";
import { registerDeckPaths } from "./deckPaths.js";
import { registerHealthPaths } from "./healthPaths.js";
import { registerSearchPaths } from "./searchPaths.js";

export const registry = new OpenAPIRegistry();

registry.register("Card", CardSchema);
registry.register("CardProgress", CardProgressSchema);
registry.register("CreateCard", CreateCardSchema);
registry.register("CardUpdate", CardUpdateSchema);
registry.register("UpsertCard", UpsertCardSchema);
registry.register("BatchUpsertCards", BatchUpsertCardsSchema);
registry.register("BatchDeleteCards", BatchDeleteCardsSchema);

registry.register("Deck", DeckSchema);
registry.register("CreateDeck", CreateDeckSchema);
registry.register("DeckUpdate", DeckUpdateSchema);

registry.register("User", UserSchema);
registry.register("RegisterUser", RegisterSchema);
registry.register("LoginUser", LoginSchema);
registry.register("ForgotUserPassword", ForgotPasswordSchema);
registry.register("ResetUserPassword", ResetPasswordSchema);
registry.register("UpdateProfile", UpdateProfileSchema);

registry.register("DateData", DateDataSchema);
registry.register("CreateDateData", CreateDateDataSchema);
registry.register("DateDataUpdate", DateDataUpdateSchema);

registerHealthPaths(registry);
registerCardPaths(registry);
registerDeckPaths(registry);
registerSearchPaths(registry);
registerAuthPaths(registry);
