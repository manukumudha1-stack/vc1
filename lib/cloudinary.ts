import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export function generateUploadSignature(folder = 'vc-sarees') {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey:    process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}

export function getTransformedUrl(url: string, width = 800) {
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
}

export default cloudinary;
