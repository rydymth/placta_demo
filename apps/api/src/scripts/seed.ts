import { samplePage } from "@placta/contracts";
import { connectDb, disconnectDb } from "../database/connection.ts";
import { PageModel } from "../models/page.model.ts";
import { findPageBySlug } from "../repositories/pages.repository.ts";
import * as pagesService from "../services/pages.service.ts";

await connectDb();
await PageModel.init();

const existing = await findPageBySlug(samplePage.slug);
const record = existing
  ? await pagesService.saveDraft(existing.id, samplePage)
  : await pagesService.createPage(samplePage);

console.info(existing ? "Updated" : "Created", record.id, "draftVersion", record.draftVersion);
await disconnectDb();
