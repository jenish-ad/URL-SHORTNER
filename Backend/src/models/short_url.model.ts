import mongoose from "mongoose";

export interface ShortUrlRecord {
  full_url: string;
  short_url: string;
  clicks: number;
  user?: mongoose.Types.ObjectId;
}

const shortUrlSchema = new mongoose.Schema<ShortUrlRecord>({
  full_url: { type: String, required: true },
  short_url: { type: String, required: true, unique: true },
  clicks: { type: Number, required: true, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
});

export default mongoose.model<ShortUrlRecord>("shortUrl", shortUrlSchema);
