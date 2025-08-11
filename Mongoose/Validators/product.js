const { body } = require('express-validator');

exports.productValidationRules = [
  body('title', 'Please enter a valid title')
    .isString()
    .isLength({ min: 3 })
    .trim(),
  body('price', 'Please enter a valid price').isFloat(),
  body('description', 'Please enter a valid description')
    .isLength({ min: 5, max: 400 })
    .trim(),
  body('imageUrl', 'Please enter a valid ImageUrl').isURL()
];