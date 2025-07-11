import arcjet from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import {
  ArcjetDecision,
  BotOptions,
  detectBot,
  EmailOptions,
  protectSignup,
  ProtectSignupOptions,
  slidingWindow,
  SlidingWindowRateLimitOptions,
} from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";
import ip from "@arcjet/ip";

const emailOptions = {
  mode: "LIVE",
  block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

const botOptions = {
  mode: "LIVE",
  allow: [],
} satisfies BotOptions;

const rateLimitOptions = {
  mode: "LIVE",
  interval: "2m",
  max: 5,
} satisfies SlidingWindowRateLimitOptions<[]>;

const signupOptin = {
  email: emailOptions,
  bots: botOptions,
  rateLimit: rateLimitOptions,
} satisfies ProtectSignupOptions<[]>;

async function protect(req: NextRequest): Promise<ArcjetDecision> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  let userId: string;
  if (session?.user.id) {
    userId = session.user.id;
  } else {
    userId = ip(req) || "127.0.0.1";
  }
  if (req.nextUrl.pathname.startsWith("/api/auth/sign-up")) {
    const body = await req.clone().json();
    if (typeof body.email === "string") {
      return arcjet
        .withRule(protectSignup(signupOptin))
        .protect(req, { email: body.email, fingerprint: userId });
    } else {
      return arcjet
        .withRule(detectBot(botOptions))
        .withRule(slidingWindow(rateLimitOptions))
        .protect(req, { fingerprint: userId });
    }
  } else {
    return arcjet
      .withRule(detectBot(botOptions))
      .protect(req, { fingerprint: userId });
  }
}

const authHandlers = toNextJsHandler(auth.handler);

export const { GET } = authHandlers;

export const POST = async (req: NextRequest) => {
  const decision = await protect(req);

  console.log("Arcjet Decision:", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return new Response(null, { status: 429 });
    } else if (decision.reason.isEmail()) {
      let message: string;
      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "Email address format is invalid. Isthere a typo?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "We do not allow disposable email address.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message = "Your email domian does not have an MX record.";
      } else {
        message = "Invalid Email";
      }

      return Response.json({ message }, { status: 400 });
    } else {
      return new Response(null, { status: 403 });
    }
  }

  return authHandlers.POST(req);
};
