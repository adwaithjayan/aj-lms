import { env } from "@/lib/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "@/lib/s3client";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requireAdmin } from "@/app/data/admin/require-admin";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );

export const fileUplaodSchema = z.object({
  fileName: z.string().min(1, "File name is Required"),
  contentType: z.string().min(1, "Content type is required"),
  size: z.number().min(1, "Size is required"),
  isImage: z.boolean(),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  try {
    const decison = await aj.protect(req, {
      fingerprint: session?.user.id as string,
    });

    if (decison.isDenied()) {
      return NextResponse.json({ error: "dude not good" }, { status: 429 });
    }

    const body = await req.json();
    const validation = fileUplaodSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Inavilde Request body" },
        { status: 400 }
      );
    }
    const { fileName, contentType, size } = validation.data;

    const uniqueKey = `${uuid()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      ContentType: contentType,
      ContentLength: size,
      Key: uniqueKey,
    });

    const presignedUrl = await getSignedUrl(S3, command, {
      expiresIn: 360, //url expires in 6 mins
    });

    const response = {
      presignedUrl,
      key: uniqueKey,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
