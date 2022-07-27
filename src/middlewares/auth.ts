const { isEmpty } = require('lodash');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const auth = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization;
      if (isEmpty(token)) {
        throw 'Token is required';
      }
      const tokenVerification = jwt.verify(
        token.slice(7),
        process.env.JWT_SECRET
      );
      const email = tokenVerification.email;
      const user = await User.findOne({ email });
  
      if (isEmpty(user)) {
        throw 'You need to register first';
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(400).json({
        error: error,
      });
    }
};

module.exports = { auth };

