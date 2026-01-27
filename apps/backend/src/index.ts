import { Hono } from "hono";
import { userRoutes } from "./modules/users.routes";
import { propertiesRoutes } from "./modules/properties.routes";
import { authRoutes } from "./modules/auth.routes";
import { corsMiddleware } from "./middleware/cors";
import { logger } from "hono/logger";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export const app = new Hono()
.use("*", corsMiddleware)
.use("*", logger())

.route('/', authRoutes)
.route("/", userRoutes)
.route("/", propertiesRoutes)

export  type App = typeof app;

const r2 = new S3Client({
  region:"auto",
  endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
   credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },

})

export const countFiles = async (BucketName: string) => {
  const command = new ListObjectsV2Command({
    Bucket: BucketName
  })
    const result = await r2.send(command)

    const files = result.Contents?.map((f) => f.Key) || []
    const fileCount = files.length;

    console.log(`Found ${fileCount} files in bucket ${BucketName}`);
    return {count : fileCount, files };
  
}

console.log(await countFiles("estate-test"))

const port = 4000;
console.log(`Server is running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch
}
