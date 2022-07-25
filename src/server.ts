import app from "./app";
const fileUpload = require('express-fileupload');
const exif = require('exif-parser');
const fs = require('fs')

const PORT = 8080;


app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    })
);

app.get('/', (req, res) => {
    res.send('Hello GeoSpatial Data Extraction!')
});

app.post('/upload', async (req: any, res) => {
    const { file } = req.files;
    const buffer = fs.readFileSync(file.tempFilePath)
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

app.listen(PORT, () => console.info("Server running at port", PORT));