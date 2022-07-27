import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    image: { 
        data: Buffer, 
        contentType: String 
    },

    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Image', imageSchema);