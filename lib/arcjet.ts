import arcjet, {
  detectBot,
  shield,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  slidingWindow,
} from "@arcjet/next";
import { env } from "./env";

export {
  detectBot,
  shield,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  slidingWindow,
};

export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["fingerprint"],
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});
