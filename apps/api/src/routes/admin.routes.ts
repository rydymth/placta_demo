import { Router } from "express";
import * as pages from "../controllers/admin.pages.controller.ts";
import * as passkeys from "../controllers/passkeys.controller.ts";
import { rateLimit } from "../middleware/rate-limit.middleware.ts";

const router = Router();

// Password-guarded actions get the same brute-force limit as login.
const reauthLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10 });

router.get("/pages", pages.list);
router.post("/pages", pages.create);
router.get("/pages/:id", pages.get);
router.put("/pages/:id/draft", pages.saveDraft);
router.delete("/pages/:id", pages.remove);
router.post("/pages/:id/duplicate", pages.duplicate);
router.post("/pages/:id/publish", pages.publish);
router.post("/pages/:id/unpublish", pages.unpublish);
router.get("/pages/:id/revisions", pages.revisions);
router.get("/pages/:id/revisions/:revisionId", pages.revision);

router.get("/passkeys", passkeys.list);
router.post("/passkeys/register/options", reauthLimiter, passkeys.registerOptions);
router.post("/passkeys/register/verify", passkeys.registerVerify);
router.post("/passkeys/:id/revoke", reauthLimiter, passkeys.revoke);

export default router;
