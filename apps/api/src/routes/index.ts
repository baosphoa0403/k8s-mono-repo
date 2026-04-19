import { type IRouter, Router } from "express";
import authRoutes from "./auth";
import crudRoutes from "./crud";
import healthRoutes from "./health";
import messageRoutes from "./message";
import userRoutes from "./user";

const router: IRouter = Router();

// Mount routes
router.use("/", healthRoutes);
router.use("/message", messageRoutes);
router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/crud", crudRoutes);

export default router;
