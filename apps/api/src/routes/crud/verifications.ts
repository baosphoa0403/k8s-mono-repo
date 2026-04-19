import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { type IRouter, Router } from "express";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
	const rows = await db.verification.findMany({
		orderBy: { createdAt: "desc" },
	});
	res.json(rows);
});

router.get("/:id", async (req, res) => {
	const row = await db.verification.findUnique({
		where: { id: req.params.id },
	});
	if (!row) {
		res.status(404).json({ error: "Not found" });
		return;
	}
	res.json(row);
});

router.post("/", async (req, res) => {
	const body = req.body as {
		id?: string;
		identifier?: string;
		value?: string;
		expiresAt?: string;
		createdAt?: string | null;
		updatedAt?: string | null;
	};
	if (!body.identifier?.trim() || !body.value?.trim() || !body.expiresAt) {
		res.status(400).json({
			error: "identifier, value, and expiresAt (ISO date) are required",
		});
		return;
	}
	const row = await db.verification.create({
		data: {
			id: body.id?.trim() || randomUUID(),
			identifier: body.identifier.trim(),
			value: body.value.trim(),
			expiresAt: new Date(body.expiresAt),
			createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
			updatedAt: body.updatedAt ? new Date(body.updatedAt) : new Date(),
		},
	});
	res.status(201).json(row);
});

router.patch("/:id", async (req, res) => {
	const { identifier, value, expiresAt, createdAt, updatedAt } = req.body as {
		identifier?: string;
		value?: string;
		expiresAt?: string;
		createdAt?: string | null;
		updatedAt?: string | null;
	};
	const data: Record<string, string | Date | null> = {};
	if (identifier !== undefined) data.identifier = identifier;
	if (value !== undefined) data.value = value;
	if (expiresAt !== undefined) data.expiresAt = new Date(expiresAt);
	if (createdAt !== undefined)
		data.createdAt = createdAt ? new Date(createdAt) : null;
	if (updatedAt !== undefined)
		data.updatedAt = updatedAt ? new Date(updatedAt) : null;
	if (Object.keys(data).length === 0) {
		res.status(400).json({ error: "No fields to update" });
		return;
	}
	try {
		const row = await db.verification.update({
			where: { id: req.params.id },
			data,
		});
		res.json(row);
	} catch (e: unknown) {
		if (isPrismaNotFound(e)) {
			res.status(404).json({ error: "Not found" });
			return;
		}
		throw e;
	}
});

router.delete("/:id", async (req, res) => {
	try {
		await db.verification.delete({ where: { id: req.params.id } });
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
