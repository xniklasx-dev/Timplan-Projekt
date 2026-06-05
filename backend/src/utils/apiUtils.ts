import { UUIDSchema } from "../docs/schemas.js";

export function parseUUID(id: string) {
  return UUIDSchema.parse(id);
}
