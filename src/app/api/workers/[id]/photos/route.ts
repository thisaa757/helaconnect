// Saves one portfolio image under public/uploads and stores the path.
// Images only, 5 MB max. The filename is generated here, never taken from the user.

import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { addWorkerPhoto, countPhotos, getWorker } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { cleanId } from "@/lib/types";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 8;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const workerId = cleanId(rawId);
  if (!workerId) return fail("Worker id must be a positive number.");
  if (!getWorker(workerId)) return fail("That worker was not found.", 404);
  if (countPhotos(workerId) >= MAX_PHOTOS) return fail(`This profile already has ${MAX_PHOTOS} photos.`);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Send the photo as form data.");
  }

  const file = form.get("photo");
  if (!(file instanceof File)) return fail("Choose an image file in the photo field.");
  if (file.size <= 0) return fail("That file is empty.");
  if (file.size > MAX_BYTES) return fail("That file is too large. Maximum size is 5 MB.");
  if (file.type && !file.type.startsWith("image/")) return fail("Please upload an image.");

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniff(bytes);
  if (!ext) return fail("Please upload a JPEG, PNG, WEBP, or GIF image.");

  const filename = `${workerId}-${Date.now()}.${ext}`;
  const folder = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(folder, { recursive: true });
  const fullPath = path.join(folder, filename);
  fs.writeFileSync(fullPath, bytes);

  try {
    const photo = addWorkerPhoto(workerId, `/uploads/${filename}`);
    return ok({ photo }, 201);
  } catch (error) {
    fs.rmSync(fullPath, { force: true });
    const message = error instanceof Error ? error.message : "Could not save the photo.";
    return fail(message, 500);
  }
}

function sniff(buf: Buffer): "jpg" | "png" | "gif" | "webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length >= 6) {
    const head = buf.subarray(0, 6).toString("ascii");
    if (head === "GIF87a" || head === "GIF89a") return "gif";
  }
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "webp";
  }
  return null;
}
