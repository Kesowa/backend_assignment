const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    //console.log(connection)
    console.info(`MongoDB Connected: ${connection.connection.host}`);
   
  } catch (error) {
    console.log(error)
  }
};

export default connectDB;
