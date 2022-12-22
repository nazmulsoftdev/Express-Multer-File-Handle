const express = require("express");
require("dotenv").config();
const multer = require("multer");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder location where file will be store

const FOLDER_LOCATION = "./uploads/";

// define the storage

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, FOLDER_LOCATION);
    },
    filename: (req, file, cb) => {
        // for change file Extension
        const fileExtntion = path.extname(file.originalname);
        const fileName = file.originalname
            .replace(fileExtntion, "")
            .toLocaleLowerCase()
            .split()
            .join("-" + "-" + Date.now());

        cb(null, fileName + fileExtntion);
    },
});

// prepare the Single upload multer Object

var upload = multer({
    storage: storage,
});

// this multer object has the power of validation single file

var validUpload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000, //1mb
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only png, jpg, jepg formates are acceptable"));
        }
    },
});

// this multer object has the power of validation Multiple file

var validMultipleFile = multer({
    storage: storage,
    limits: {
        fileSize: 1e7, //10mb
    },
    fileFilter: (req, file, cb) => {
        console.log(file);
        if (file.fieldname === "userProfile") {
            if (
                file.mimetype === "image/png" ||
                file.mimetype === "image/jpg" ||
                file.mimetype === "image/jpeg"
            ) {
                cb(null, true);
            } else {
                cb(new Error("Only png, jpg, jepg formates are acceptable"));
            }
        } else if (file.fieldname === "userDocument") {
            if (file.mimetype === "application/pdf") {
                cb(null, true);
            } else {
                cb(new Error("Only pdf formates are acceptable"));
            }
        } else {
            cb(new Error("There was an unknown error"));
        }
    },
});

app.get("/", (req, res) => {
    res.send("Express world");
});

// this  post request will take a single file
app.post("/singleProfile", upload.single("avatar"), (req, res) => {
    console.log(req.file);
    res.send("Single File Uploaded !");
});

// this  post request will take a Multiple file

app.post("/galleryImage", upload.array("gallery", 3), (req, res) => {
    console.log(req.file);
    res.send("Gallery File Uploaded !");
});

// this post request will take  Multiple File Upload with two input file field

app.post(
    "/profileWithGallery",
    upload.fields([
        { name: "profilePic", maxCount: 1 },
        { name: "galleryPic", maxCount: 5 },
    ]),
    (req, res) => {
        console.log(req.file);
        res.send("Profile and Gallery Image Uploaded !");
    }
);

// this post request will take Input text data

app.post("/textData", upload.none(), (req, res) => {
    console.log(req.body);
    res.send("Successfully Input text uploaded !");
});

// this post request will take specific file and limited size

app.post("/validationUpload", validUpload.single("validFile"), (req, res) => {
    res.send("Validation file uploaded");
});

// this post request will take diffrent formate value with validation

app.post(
    "/uploadBigfile",
    validMultipleFile.fields([
        { name: "userProfile", maxCount: 1 },
        { name: "userDocument", maxCount: 1 },
    ]),
    (req, res) => {
        console.log(req.file);
        res.send("Profile and Document are uploaded !");
    }
);

//Multer file Error Handling

app.use((err, req, res, next) => {
    if (err) {
        if (err instanceof multer.MulterError) {
            res.status(500).send("There was an upload error !");
        } else {
            res.status(500).send(err.message);
        }
    } else {
        res.send("Seccess");
    }
});

const PORT = process.env.PORT_NO || 5000;

app.listen(PORT, () => {
    console.log(`server runing on ${PORT}`);
});