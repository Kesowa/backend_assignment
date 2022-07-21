# Kesowa Back End Developer Assignment

## Overview
A Node.js REST server where users can upload geospatial data and extract information.

## Requirements
- Node.js
- MongoDB

## Objective
Make all the tests pass `npm test`

## Steps
1. Fork the repository
2. Create all the necessary endpoints
3. Pass all the tests
4. Submit a pull request
5. Wait for approval

## Restrictions
- Do not change modify contents of `__tests__` unless neccessary
- Use a mongoDB server instance to store all data
- Use disk storage to store all media
- Use Authorization header for authentication

## Hints
- Every image has some exif GPS metadata in the following format. Use an exif parser library to extract the longitude and latitude.

    ```exif:GPSAltitude: 64022/1000
        exif:GPSAltitudeRef: 1
        exif:GPSDateStamp: 2022:01:03
        exif:GPSInfo: 3627
        exif:GPSLatitude: 22/1, 35/1, 179159/10000
        exif:GPSLatitudeRef: N
        exif:GPSLongitude: 88/1, 27/1, 37260/10000
        exif:GPSLongitudeRef: E
        exif:GPSProcessingMethod: 65, 83, 67, 73, 73, 0, 0, 0, 71, 80, 83, 0
        exif:GPSTimeStamp: 10/1, 23/1, 54/1
    ```