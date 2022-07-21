import request from "supertest";

import app from "../src/app";

const userCreds = {
    email: "test@user.com",
    password: "password0000"
};

const login = async () => {
    const res = await request(app)
        .post("/login")
        .send(userCreds);
    if (typeof res.body.token !== "string") throw new Error(`invalid token ${res.body.token}`);
    return res.body.token as string;
}

beforeAll(async () => {
    // connect to the database here
})

afterAll(async () => {
    // close database connection here
})

describe("Test authentication", () => {
    test("Register user", async () => {
        const res = await request(app)
            .post("/signup")
            .send(userCreds)
            .expect(201);
        expect(res.body).toEqual({
            status: true,
            message: "registeration successful"
        })
    });

    test("Register with invalid email", async () => {
        const res = await request(app)
            .post("/signup")
            .expect(400);
    });

    test("Login user", async () => {
        const res = await request(app)
            .post("/login")
            .send(userCreds)
            .expect(200);
        expect(res.body).toEqual({
            status: true,
            message: "logged in",
            token: expect.any(String)
        });
    });

    test("Login with invalid password", async () => {
        const res = await request(app)
            .post("/login")
            .send({ ...userCreds, password: "1234" })
            .expect(401);
        expect(res.body).toEqual({
            status: true,
            message: "invalid credentials"
        });
    });
})

type Coordinates = {
    lat: number,
    lng: number
}

type ImageData = {
    image: string,
    coords: Coordinates
};

describe("Test image upload", () => {
    let token: string;
    beforeAll(async () => {
        token = await login();
    });
    let sampleImages: Array<ImageData> = [];
    test("Upload multiple images", async () => {
        const res = await request(app)
            .post("/image")
            .set('Authorization', `Bearer ${token}`)
            .attach("image", "assets/1.jpg")
            .attach("image", "assets/2.jpg")
            .attach("image", "assets/3.jpg")
            .attach("image", "assets/4.jpg")
            .expect(201);
        expect(res.body).toEqual({
            status: true,
            message: "uploaded 4 images",
            data: expect.any(Array<ImageData>)
        });
        sampleImages = res.body.data;
    });

    test("Fetch all user images", async () => {
        const res = await request(app)
            .get("/image")
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toEqual({
            status: true,
            message: "found 4 images",
            data: expect.arrayContaining(sampleImages)
        });
    })

    test("Fetch single image", async () => {
        const res = await request(app)
            .get("/image/" + sampleImages[0].image)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toEqual({
            status: true,
            message: "found image",
            data: sampleImages[0]
        });
    })
})