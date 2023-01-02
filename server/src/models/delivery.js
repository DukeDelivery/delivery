const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  company: String,
  description: String,
  start: Date,
  end: Date,
  contactName: String,
  contactNumber: String,
  gate: String, 
  schedName: String,
  schedNumber: String,
  supplier: String,
  hoistMethod: String,
  trucks: Number,
  notes: String,
  approved: Boolean,
  completed: Boolean,
});

deliverySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.start = new Date(ret.start).valueOf();
    ret.end = new Date(ret.end).valueOf();
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
})
module.exports = mongoose.model('Delivery', deliverySchema);