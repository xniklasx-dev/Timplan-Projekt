import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  BatchUpsertCardsSchema,
  CardSchema,
  CardUpdateSchema,
  CreateCardSchema,
  DateDataSchema,
  DeckSchema,
  UpsertCardSchema,

  UserSchema,
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
} from "./schemas.js";

export const registry = new OpenAPIRegistry();

registry.register("Card", CardSchema);
registry.register("CreateCard", CreateCardSchema);
registry.register("CardUpdate", CardUpdateSchema);
registry.register("UpsertCard", UpsertCardSchema);
registry.register("BatchUpsertCards", BatchUpsertCardsSchema);
registry.register("Deck", DeckSchema);
registry.register("DateData", DateDataSchema);

registry.register("User", UserSchema);
registry.register("RegisterUser", RegisterSchema);
registry.register("LoginUser", LoginSchema);
registry.register("ForgotUserPassword", ForgotPasswordSchema);
registry.register("ResetUserPassword", ResetPasswordSchema);
registry.register("UpdateProfile", UpdateProfileSchema);
