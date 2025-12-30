// routes/loanRoutes.js - ES Module version
import express from 'express';
import { applyLoan, getLoan } from '../controllers/loanController.js';

const router = express.Router();

router.post('/apply', applyLoan);
router.get('/:id', getLoan);

export default router;