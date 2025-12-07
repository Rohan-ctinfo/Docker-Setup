import express from 'express';
import openTalentRoutes from './open-talent.route.js';
import commonRoutes from './common.route.js';
import coachRoutes from './coach.route.js';
import adminRoutes from './admin.route.js';
import publicRoutes from './public.route.js';
import { coachAuthGuard } from '../middlewares/guard.middleware.js';
import socketRoutes from './socket.route.js';

const router = express.Router();

router.use('/open-talent', openTalentRoutes);
router.use('/common', commonRoutes);
router.use('/coach', coachAuthGuard, coachRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/socket', socketRoutes);

export default router;

