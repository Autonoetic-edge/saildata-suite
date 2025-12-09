import { Router } from 'express';
import {
    getAnalyticsOverview,
    getForwarderStats,
    getContainerStats,
    getAnalyticsTotals,
    getStatusStats
} from '../controllers/analyticsController';

const router = Router();

router.get('/overview', getAnalyticsOverview);
router.get('/forwarders', getForwarderStats);
router.get('/containers', getContainerStats);
router.get('/totals', getAnalyticsTotals);
router.get('/status', getStatusStats);

export default router;
