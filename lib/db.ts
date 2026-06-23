import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | null;
}

let cachedPromise: Promise<typeof mongoose> | null = global._mongoosePromise ?? null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Please define MONGODB_URI in .env.local');
  if (!cachedPromise) {
    cachedPromise = mongoose.connect(uri);
    global._mongoosePromise = cachedPromise;
  }
  return cachedPromise;
}
