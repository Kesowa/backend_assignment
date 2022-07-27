const mongoose = require('mongoose');
const cryptoM = require('crypto');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


// methods
userSchema.methods = {
  authenticate(plainText: any) {
    return this.encryptPassword(plainText) === this.password;
  },

  encryptPassword(code: any) {
    if (!code) return '';
    try {
      return cryptoM
        .createHmac('sha1', '123')
        .update(code)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },

  generateHash(password: any) {
    return cryptoM
          .createHmac('sha1', '123')
          .update(password)
          .digest('hex');
  },
  
};



module.exports = mongoose.model('User', userSchema);
