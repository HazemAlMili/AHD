import { Router, type IRouter } from "express";
import { getContentBlock, getPublicSettings, getPublicWorker, listNationalities, listPublicWorkers, listSkills } from "../lib/repository";

const router: IRouter = Router();

router.get("/v1/workers", async (req, res, next) => {
  try {
    const workers = await listPublicWorkers({
      query: typeof req.query.q === "string" ? req.query.q : undefined,
      nationality: typeof req.query.nationality === "string" ? req.query.nationality : undefined,
      skill: typeof req.query.skill === "string" ? req.query.skill : undefined,
      availability: typeof req.query.availability === "string" ? req.query.availability : undefined,
    });
    res.json({ data: workers });
  } catch (error) { next(error); }
});

router.get("/v1/workers/:slug", async (req, res, next) => {
  try {
    const worker = await getPublicWorker(String(req.params.slug));
    if (!worker) { res.status(404).json({ message: "Worker not found" }); return; }
    res.json({ data: worker });
  } catch (error) { next(error); }
});

router.get("/v1/content/:key", async (req, res, next) => {
  try {
    const block = await getContentBlock(String(req.params.key));
    if (!block) { res.status(404).json({ message: "Content not found" }); return; }
    res.json({ data: block });
  } catch (error) { next(error); }
});

router.get("/v1/nationalities", async (_req, res, next) => {
  try { res.json({ data: await listNationalities() }); } catch (error) { next(error); }
});

router.get("/v1/skills", async (_req, res, next) => {
  try { res.json({ data: await listSkills() }); } catch (error) { next(error); }
});

router.get("/v1/public-settings", async (_req, res, next) => {
  try { res.json({ data: await getPublicSettings() }); } catch (error) { next(error); }
});

export default router;
