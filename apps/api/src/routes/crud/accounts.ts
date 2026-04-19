import { db } from "@repo/db";
import { type IRouter, Router } from "express";

/**
 * Accounts are owned by Better Auth. List / get / delete only for admin/demo.
 */
const router: IRouter = Router();

router.get("/", async (_req, res) => {
	const rows = await db.account.findMany({ orderBy: { createdAt: "desc" } });
	res.json(rows);
});

router.get("/:id", async (req, res) => {
	const row = await db.account.findUnique({ where: { id: req.params.id } });
	if (!row) {
		res.status(404).json({ error: "Not found" });
		return;
	}
	res.json(row);
});

router.delete("/:id", async (req, res) => {
	try {
		await db.account.delete({ where: { id: req.params.id } });
		res.status(204).send();
	} catch (e: unknown) {
		if (isPrismaNotFound(e)) {
			res.status(404).json({ error: "Not found" });
			return;
		}
		throw e;
	}
});

function isPrismaNotFound(e: unknown): boolean {
	return (
		typeof e === "object" && e !== null && "code" in e && e.code === "P2025"
	);
}

export default router;
