import { pageSchema } from "@placta/contracts";
import * as pageRepo from "../repositories/pages.repository.ts"
import type { PageRecord } from "../repositories/pages.repository.ts";

export class PageNotFoundError extends Error {
  constructor(id: string) {
    super(`Page ${id} not found`);
    this.name = "PageNotFoundError"
  }
}

export async function createPage(inp: unknown): Promise<PageRecord> {
  const page = pageSchema.parse(inp); // zod error handling so no need to wire in try catch
  return pageRepo.createPage(page);
}

export async function getPage(id: string): Promise<PageRecord> {
  const record = await pageRepo.findPageById(id);
  if (!record) throw new PageNotFoundError(id);
  return record;
}

export async function saveDraft(id: string, inp: unknown): Promise<PageRecord> {
  const page = pageSchema.parse(inp);
  const record = await pageRepo.updateDraft(id, page);
  if (!record) throw new PageNotFoundError(id);
  return record;
}
