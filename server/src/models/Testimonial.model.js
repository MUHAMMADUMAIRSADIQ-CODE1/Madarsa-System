const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const testimonialSchema = createBaseSchema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  role: { type: String, trim: true, maxlength: 100 },
  content: { type: String, required: true, trim: true, maxlength: 2000 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  imageUrl: { type: String },
  isPublished: { type: Boolean, default: false, index: true },
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  indexes: [{ fields: { isPublished: 1, isFeatured: -1, order: 1 } }],
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
