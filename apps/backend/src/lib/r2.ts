import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;


export const uploadToR2 = async (key: string, body: Buffer, contentType: string) => {
  await r2.send(
   
    new PutObjectCommand({
      Bucket: BUCKET_NAME, 
      Key: key, 
      Body: body, 
      ContentType: contentType, 
    })
  );
};

export const deleteFromR2 = async (key: string) => {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key, 
    })
  );
};

export const getR2PublicUrl = (key: string) => {
  // ต่อ URL ให้ไม่เกิด "//" และไม่พังเวลามี/ไม่มี "/" ท้ายสตริง
  const joinUrl = (base: string, path: string) => {
    const b = base.replace(/\/+$/, ""); // ตัด "/" ท้าย base ออก
    const p = path.replace(/^\/+/, ""); // ตัด "/" หน้า path ออก
    return `${b}/${p}`;
  };

  // ถ้ามีตั้งค่า public domain เอง (เช่น pub-xxxx.r2.dev หรือ custom domain) ให้ใช้ตัวนี้
  if (process.env.R2_PUBLIC_URL) {
    return joinUrl(process.env.R2_PUBLIC_URL, key);
  }

  // fallback: ใช้โดเมนมาตรฐานของ bucket
  return joinUrl(`https://${BUCKET_NAME}.r2.cloudflarestorage.com`, key);
};

