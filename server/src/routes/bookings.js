const express = require('express');
const { body, param } = require('express-validator');
const { create, getMy, cancel, getAll } = require('../controllers/bookingController');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const validate = require('../middleware/validate');

const router = express.Router();

// /my MUST come before /:id to avoid route conflict
router.get('/my', authenticate, getMy);

router.post(
  '/',
  authenticate,
  [
    body('apartmentId').notEmpty().withMessage('Apartment ID is required'),
    body('checkIn').isISO8601().toDate().withMessage('Valid check-in date is required'),
    body('checkOut').isISO8601().toDate().withMessage('Valid check-out date is required'),
    body('guests').isInt({ min: 1 }).withMessage('At least 1 guest is required'),
  ],
  validate,
  create
);

router.get('/', authenticate, requireAdmin, getAll);
router.patch('/:id/cancel', authenticate, param('id').isUUID().withMessage('Invalid booking ID'), validate, cancel);

module.exports = router;
