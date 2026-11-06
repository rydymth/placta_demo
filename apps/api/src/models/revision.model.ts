import { Schema, model } from "mongoose";

const revisionDbSchema = new Schema(
  {
    pageId: { type: Schema.Types.ObjectId, required: true, index: true },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    publishedBy: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: { createdAt: "publishedAt", updatedAt: false } },
);

revisionDbSchema.index({ pageId: 1, version: 1 }, { unique: true });

export const RevisionModel = model("PageRevision", revisionDbSchema);
