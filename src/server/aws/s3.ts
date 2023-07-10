import { S3 } from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";

export const s3 = new S3({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_KEY_ID,
  },
});
