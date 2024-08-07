import { Router } from 'express';
import appRouter from './app_route';
import authRouter from './auth_route';
import usersRouter from './user_route';
import filesRouter from './file_route';

// App router
const router = Router();
router.use(appRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(filesRouter);

export default router;
