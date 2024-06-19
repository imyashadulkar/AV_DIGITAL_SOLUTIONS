import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema
const contactSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: Number,
    required: true
  },
  emailId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

// Create the model
export const Contact = mongoose.model('Contact', contactSchema);


