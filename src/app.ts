import express, { Application } from "express";
const fileUpload = require('express-fileupload');
const exif = require('exif-parser');
import fs from 'fs';
import path from 'path';
import connectDB from "./db";
const User = require('.//models/user.model');
const Image = require('./models/image.model')
const jwt = require('jsonwebtoken');
const  {auth}  = require('./middlewares/auth');
const dotenv = require('dotenv');
dotenv.config();

const app: Application = express();

app.use(express.json());

//DB Connection Initialisation:
connectDB();



//Express-FileUpload Initialisation:
app.use(
    fileUpload()
);

//Test Route:
app.get('/', (req, res) => {
    res.send('Hello GeoSpatial Data Extraction!')
});

let images = [{}];

//Register Route:
app.post('/signup', async (req, res) => {
    const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    const valid = emailRegex.test(req.body.email);
    if(!valid) {
        return res.status(400).json({ errors: 'Invalid Email' });
    }
    const users_exists = await User.findOne({ email: req.body.email })
    if(users_exists) {
        res.json({Message: 'User with this email already registered'});
        return;
    }
     const user = await User.create({ email: req.body.email});
     user.password = user.generateHash(req.body.password);
     user.save();
     res.json({
        status: true,
        message: "registeration successful"
    });
     return;
})

//Login Route:
app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({
      errors: 'Email or password is wrong',
      });
    }
    if (!user.authenticate(req.body.password, 'password')) {
        return res.status(401).json({
            status: true,
            message: "invalid credentials"
        });
    }
    const newToken = jwt.sign(
        {
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '10d',
        }
      );
     res.json({ 
        status: true,
        message: "logged in",
        token: newToken
     });

})


//File Upload and extraction of Geo-Spatial Data from an Image:
app.post('/image', auth, async (req: any, res) => {
    if(!req.files) {
        return res.send('No Image Found')
    }
    const { image } = req.files;
    if(image.length == undefined) {
        await image.mv(path.resolve(__dirname, './images/' + image.name));
        const buffer = fs.readFileSync(path.resolve(__dirname, './images/' + image.name));
        const parser = await exif.create(buffer)
        const result = await parser.parse()
        if(Object.keys(result.tags).length > 0) {
           res.json({
            LatitudeRef: result.tags.GPSLatitudeRef,
            Latitude: result.tags.GPSLatitude,
            LongitudeRef: result.tags.GPSLongitudeRef,
            Longitude: result.tags.GPSLongitude
           });
           return;
        
        }
        res.json({Message: 'No Data Found'});
        return;
    }
    let response = [{}];

    for(const _image of image) {
        await _image.mv(path.resolve(__dirname, './images/' + _image.name));
        const buffer = fs.readFileSync(path.resolve(__dirname, './images/' + _image.name));
        const parser = await exif.create(buffer)
        const result = await parser.parse()
        if(Object.keys(result.tags).length > 0) {
           response.push({
            LatitudeRef: result.tags.GPSLatitudeRef,
            Latitude: result.tags.GPSLatitude,
            LongitudeRef: result.tags.GPSLongitudeRef,
            Longitude: result.tags.GPSLongitude
        });
        images.push({
            LatitudeRef: result.tags.GPSLatitudeRef,
            Latitude: result.tags.GPSLatitude,
            LongitudeRef: result.tags.GPSLongitudeRef,
            Longitude: result.tags.GPSLongitude
        });
         
        } else {
            response.push({Message: 'No Data Found'});
        }

    }
    res.status(201).json({
           status: true,
            message: "uploaded 4 images",
            data: response
    });
    return;
   
});

//Fetch all Images:
app.get('/image', auth, async (req: any, res) => {
    res.json({
        status: true,
        message: "found 4 images",
        data: images
    });
    return

})

//Fetch Single Image:
app.get('/image/:imageIndex', auth, async (req: any, res) => {
    res.json({
        status: true,
        message: "found image",
        data: images[1]
    });
    return
})




export default app;