const express = require('express');
const { body, param, query } = require('express-validator');
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
  body('amenities').optional().isArray().withMessage('Amenities must be a list'),
  body('amenities.*').optional().isString().trim().notEmpty().withMessage('Amenities cannot be empty'),
  body('images').optional().isArray().withMessage('Images must be a list'),
  body('images.*').optional().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Each image must be a valid URL'),
];

const updateValidation = [
  param('id').isUUID().withMessage('Invalid apartment ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('pricePerNight').optional().isFloat({ min: 0 }).withMessage('Price per night must be non-negative'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be non-negative'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be non-negative'),
  body('maxGuests').optional().isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
  body('isAvailable').optional().isBoolean().withMessage('Availability must be true or false'),
  body('amenities').optional().isArray().withMessage('Amenities must be a list'),
  body('amenities.*').optional().isString().trim().notEmpty().withMessage('Amenities cannot be empty'),
  body('images').optional().isArray().withMessage('Images must be a list'),
  body('images.*').optional().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Each image must be a valid URL'),
];

const searchValidation = [
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be non-negative'),
  query('guests').optional().isInt({ min: 1 }).withMessage('Guests must be at least 1'),
  query('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be non-negative'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('checkIn').optional().isISO8601().withMessage('Check-in must be a valid date'),
  query('checkOut').optional().isISO8601().withMessage('Check-out must be a valid date'),
];

router.get('/', searchValidation, validate, getAll);
router.get('/:id', param('id').isUUID().withMessage('Invalid apartment ID'), validate, getOne);
router.post('/', authenticate, requireAdmin, createValidation, validate, create);
router.put('/:id', authenticate, requireAdmin, updateValidation, validate, update);
router.delete('/:id', authenticate, requireAdmin, [param('id').isUUID()], validate, remove);

module.exports = router;
