import { type IRouter, Router } from "express";
import accountsRoutes from "./accounts";
import sessionsRoutes from "./sessions";
import usersRoutes from "./users";
import verificationsRoutes from "./verifications";

const router: IRouter = Router();

router.use("/users", usersRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/accounts", accountsRoutes);
router.use("/verifications", verificationsRoutes);

export default router;
