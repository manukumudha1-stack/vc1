import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env.local') });

export default async function globalSetup() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  await mongoose.connect(uri);
  // Reset test product stock before every run so cart tests never deplete it
  await mongoose.connection.collection('products').updateOne(
    { slug: 'kandangi-earth-check-weave' },
    { $set: { stockQty: 50 } }
  );
  await mongoose.disconnect();
}
