import mongoose from "mongoose";
import type { Page, PageStatus } from "@placta/contracts";
import { PageModel } from "../models/page.model.ts";

/*
 * Exports
*/

export interface PageRecord {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  draft: Page;
  published: Page | null;
  currentPublishedRevisionId: string | null;
  draftVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

// TODO: custom error -> Can be in its own dir/file
export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`Slug "${slug}" is already in use`);
    this.name = "SlugTakenError";
  }
}

export async function createPage(page: Page): Promise<PageRecord> {
  try {
    const doc = await PageModel.create({
      title: page.title,
      slug: page.slug,
      draft: page
    })
    return toRecord(doc.toObject());
  }
  catch (err) {
    if (isDupeKey(err)) throw new SlugTakenError(page.slug)
    throw err; // if not dupe
  }
}

export async function findPageById(id: string): Promise<PageRecord | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await PageModel.findById(id).lean();
  return doc ? toRecord(doc) : null;
}

export async function findPageBySlug(slug: string): Promise<PageRecord | null> {
  const doc = await PageModel.findOne({ slug }).lean();
  return doc ? toRecord(doc) : null;
}

export async function updateDraft(id: string, page: Page): Promise<PageRecord | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  try {
    const doc = await PageModel.findByIdAndUpdate(
      id,
      // Only draft-related fields. Never touch `published` or `status` here.
      { $set: { title: page.title, slug: page.slug, draft: page }, $inc: { draftVersion: 1 } },
      { new: true },
    ).lean();
    return doc ? toRecord(doc) : null;
  }
  catch (err) {
    if (isDupeKey(err)) throw new SlugTakenError(page.slug);
    throw err;
  }
}

/*
  * Private functions!
*/

// Convert a Mongo document into a plain object so Mongoose details don't leak upward.
function toRecord(doc: any): PageRecord {
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    status: doc.status,
    draft: doc.draft,
    published: doc.published ?? null, // can be null if not published
    currentPublishedRevisionId: doc.currentPublishedRevisionId
      ? String(doc.currentPublishedRevisionId)
      : null,
    draftVersion: doc.draftVersion,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function isDupeKey(err: unknown): boolean {
  return (typeof err === "object") &&
    (err != null) &&
    (err as { code?: number }).code === 11000;
}
