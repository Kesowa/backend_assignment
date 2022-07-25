import app from "./app";
const fileUpload = require('express-fileupload');
const exif = require('exif-parser');
import fs from 'fs';
import path from 'path';
import connectDB from "./db";
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


//File Upload and extraction of Geo-Spatial Data from an Image:
app.post('/upload', async (req: any, res) => {
    const { file } = req.files;
    await file.mv(path.resolve(__dirname, '../assets/' + file.name));
    const buffer = fs.readFileSync(path.resolve(__dirname, '../assets/' + file.name));
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
   
});


//Server Listening on Port:
app.listen(PORT, () => console.info("Server running at port", PORT));