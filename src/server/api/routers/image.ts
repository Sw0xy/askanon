import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const imageRouter = createTRPCRouter({
  getUploadPresignedUrl: publicProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { key } = input;
      const { s3 } = ctx;

      const putObjectCommand = new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: key,
      });

      return {
        signedUrl: await getSignedUrl(s3, putObjectCommand),
        fileUrl: `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`,
      };
    }),
});
