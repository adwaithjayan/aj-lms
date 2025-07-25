import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { S3 } from "@/lib/s3client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

export async function DELETE(req: Request) {
  const session = await requireAdmin();

  const decison = await aj.protect(req, {
    fingerprint: session?.user.id as string,
  });

  if (decison.isDenied()) {
    return NextResponse.json({ error: "dude not good" }, { status: 429 });
  }

  try {
    const body = await req.json();

    const key = body.key;
    if (!key) {
      return NextResponse.json(
        {
          error: "Missing or inavild object key",
        },
        { status: 400 }
      );
    }
    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: key,
    });

    await S3.send(command);

    return NextResponse.json(
      { message: "File deleted succesfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Internal Error",
      },
      { status: 500 }
    );
  }
}
