import { z } from "zod";
import "./commonSchemas.js"; 

export const MAX_BYTES = 2 * 1024 * 1024; // max. 2MB

const ALLOWED_TYPES = new Set([
  "image/png", 
  "image/jpeg", 
  "image/jpg", 
  "image/gif", 
  "image/webp",
]);

const DATA_URL_PATTERN =
  /^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/]+={0,2})$/;

// Magic Bytes for each type of images 
const SIGNATURES: Record<string, number[][]> = {
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
};

function bufferStartsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, i) => buffer[i] === byte);
}

function isValidWebp(buffer: Buffer): boolean {
  return buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";
}

function matchesMime(mime: string, buffer: Buffer): boolean {
  const normalized = mime === "image/jpg" ? "image/jpeg" : mime;
  if (normalized === "image/webp") return isValidWebp(buffer);
  const signatures = SIGNATURES[normalized];
  return signatures ? signatures.some((sig) => bufferStartsWith(buffer, sig)) : false;
}

export const AvatarUploadSchema = z
  .object({
    avatarUrl: z.string().min(1).superRefine((value, ctx) => {
      const match = DATA_URL_PATTERN.exec(value);
      if (!match) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Avatar muss eine Bild-Data-URL sein" });
        return;
      }
      const [, rawMime, base64Payload] = match;
      const mime = rawMime.toLowerCase();
      if (!ALLOWED_TYPES.has(mime)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Nicht unterstützter Bildtyp "${rawMime}"` });
        return;
      }
      const buffer = Buffer.from(base64Payload, "base64");
      if (buffer.length === 0 || buffer.length > MAX_BYTES) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Avatar muss zwischen 1 Byte und 2MB groß sein" });
        return;
      }
      if (!matchesMime(mime, buffer)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Dateiinhalt entspricht nicht dem angegebenen Bildtyp" });
      }
    }),
  })
  .strict()
  .openapi("AvatarUpload");