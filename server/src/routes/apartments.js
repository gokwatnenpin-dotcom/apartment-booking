const express = require('express');
const { body } = require('express-validator');
const { getAll, getOne, create, update, remove } = require('../controllers/apartmentController');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const validate = require('../middleware/validate');

const router = express.Router();

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('pricePerNight').isFloat({ min: 0 }).withMessage('Price per night must be a non-negative number'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('maxGuests').isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
];

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authenticate, requireAdmin, createValidation, validate, create);
router.put('/:id', authenticate, requireAdmin, validate, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
