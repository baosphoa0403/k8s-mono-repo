import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { type IRouter, Router } from "express";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
	const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
	res.json(users);
});

router.get("/:id", async (req, res) => {
	const user = await db.user.findUnique({ where: { id: req.params.id } });
	if (!user) {
		res.status(404).json({ error: "Not found" });
		return;
	}
	res.json(user);
});

router.post("/", async (req, res) => {
	const { name, email, emailVerified, image } = req.body as {
		name?: string;
		email?: string;
		emailVerified?: boolean;
		image?: string | null;
	};
	if (!name?.trim() || !email?.trim()) {
		res.status(400).json({ error: "name and email are required" });
		return;
	}
	try {
		const user = await db.user.create({
			data: {
				id: randomUUID(),
				name: name.trim(),
				email: email.trim(),
				emailVerified: Boolean(emailVerified),
				image: image ?? null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});
		res.status(201).json(user);
	} catch (e: unknown) {
		if (isPrismaUnique(e)) {
			res.status(409).json({ error: "Email already exists" });
			return;
		}
		throw e;
	}
});

router.patch("/:id", async (req, res) => {
	const { name, email, emailVerified, image } = req.body as {
		name?: string;
		email?: string;
		emailVerified?: boolean;
		image?: string | null;
	};
	const data: {
		name?: string;
		email?: string;
		emailVerified?: boolean;
		image?: string | null;
		updatedAt: Date;
	} = { updatedAt: new Date() };
	if (name !== undefined) data.name = name;
	if (email !== undefined) data.email = email;
	if (emailVerified !== undefined) data.emailVerified = emailVerified;
	if (image !== undefined) data.image = image;
	try {
		const user = await db.user.update({
			where: { id: req.params.id },
			data,
		});
		res.json(user);
	} catch (e: unknown) {
		if (isPrismaNotFound(e)) {
			res.status(404).json({ error: "Not found" });
			return;
		}
		if (isPrismaUnique(e)) {
			res.status(409).json({ error: "Email already exists" });
			return;
		}
		throw e;
	}
});

router.delete("/:id", async (req, res) => {
	try {
		await db.user.delete({ where: { id: req.params.id } });
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

function isPrismaUnique(e: unknown): boolean {
	return (
		typeof e === "object" && e !== null && "code" in e && e.code === "P2002"
	);
}

export default router;
