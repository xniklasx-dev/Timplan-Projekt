import { UUIDSchema } from "../validation/commonSchemas.js";

export function parseUUID(id: string) {
  return UUIDSchema.parse(id);
}
