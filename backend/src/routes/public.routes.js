import express from 'express';
import * as publicController from '../controllers/public.controller.js';

const router = express.Router();

router.get('/waste-categories', publicController.getWasteCategories);
router.get('/waste-categories/:slug', publicController.getWasteCategoryBySlug);

export default router;
