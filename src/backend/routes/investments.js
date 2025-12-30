// routes/investments.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/investmentController');

router.post('/investments', controller.createInvestment);
router.get('/investments/:investmentId', controller.getInvestment);

module.exports = router;
