import app from "./app";
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


const PORT = 8080;



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

//Register Route:
app.post('/register', async (req, res) => {
    const users_exists = await User.findOne({ email: req.body.email })
    if(users_exists) {
        res.json({Message: 'User with this email already registered'});
        return;
    }
     const user = await User.create({ email: req.body.email});
     user.password = user.generateHash(req.body.password);
     user.save();
     const newToken = jwt.sign(
        {
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '10d',
        }
      );
     res.json({ token: newToken,
       email: user.email,
       _id: user._id
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
        return res.json({
          errors: 'Email and password do not match',
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
     res.json({ token: newToken,
       email: user.email,
       _id: user._id
    });

})


//File Upload and extraction of Geo-Spatial Data from an Image:
app.post('/upload', auth, async (req: any, res) => {
    if(!req.files) {
        return res.send('No Image Found')
    }
    console.log(__dirname)
    const { file } = req.files;
    if(file.length == undefined) {
        await file.mv(path.resolve(__dirname, './images/' + file.name));
        const buffer = fs.readFileSync(path.resolve(__dirname, './images/' + file.name));
        const parser = await exif.create(buffer)
        const result = await parser.parse()
        if(Object.keys(result.tags).length > 0) {
           res.json({
            LatitudeRef: result.tags.GPSLatitudeRef,
            Latitude: result.tags.GPSLatitude,
            LongitudeRef: result.tags.GPSLongitudeRef,
            Longitude: result.tags.GPSLongitude
           });
           await Image.create({
            image: {
                data: buffer,
                contentType: file.name
            },
            user: req.user._id
           });
           
           return;
        
        }
        res.json({Message: 'No Data Found'});
        return;
    }
    let response = [{}];

    for(const image of file) {
        await image.mv(path.resolve(__dirname, './images/' + image.name));
        const buffer = fs.readFileSync(path.resolve(__dirname, './images/' + image.name));
        const parser = await exif.create(buffer)
        const result = await parser.parse()
        if(Object.keys(result.tags).length > 0) {
           response.push({
            LatitudeRef: result.tags.GPSLatitudeRef,
            Latitude: result.tags.GPSLatitude,
            LongitudeRef: result.tags.GPSLongitudeRef,
            Longitude: result.tags.GPSLongitude
        });
         await Image.create({
            image: {
                data: buffer,
                contentType: image.name
            },
            user: req.user._id
        });
        } else {
            response.push({Message: 'No Data Found'});
        }

    }
    res.json(response);
    return;
   
});

//Fetch all Images:
app.get('/images', auth, async (req: any, res) => {
    let images = ['']
    fs.readdirSync(`${__dirname}/images/`).forEach(file => {
        images.push(file)
    });
    res.json(images);
    return

})

//Fetch Single Image:
app.get('/image', auth, async (req: any, res) => {
    // fs.readdirSync(`${__dirname}/images/`).forEach(file => {
    //     res.json(file);
    //     return;
    // });
    let images = ['']
    fs.readdirSync(`${__dirname}/images/`).forEach(file => {
        images.push(file)
    });
    res.json(images[1]);
    return
})


//Server Listening on Port:
app.listen(PORT, () => console.info("Server running at port", PORT));