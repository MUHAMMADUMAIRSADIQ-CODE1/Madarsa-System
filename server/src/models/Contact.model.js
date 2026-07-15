const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const contactSchema = createBaseSchema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  isRead: { type: Boolean, default: false },
  repliedAt: { type: Date },
  replyMessage: { type: String, trim: true },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  indexes: [{ fields: { isRead: 1, createdAt: -1 } }],
});

module.exports = mongoose.model('Contact', contactSchema);
