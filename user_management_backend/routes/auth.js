const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const authModelSchema = require('../models/authModel');
const secretKey = "dfihjsauiuhewruihefjdfhjh3242893798#$@#TGFASaqwea$353ad"
const verifyToken = require('../verifyToken');

const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        cb(null, true);
    },
});

cloudinary.config({
    cloud_name: "doyftv2up",
    api_key: "489584776537634",
    api_secret: "tw7WlHjCTy2mZhJDOAqeC6GPXMo",
});

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    await authModelSchema.findOne({ email: email }).then(existUser => {
        console.log(existUser, "userrrrr");
        if (existUser && existUser._id) {
            bcrypt.compare(password, existUser.password, (err, response) => {
                if (!err) {
                    if (response) {
                        const authToken = jwt.sign({ _id: existUser._id, email: existUser.email }, secretKey, {
                            expiresIn: '1h'
                        })
                        res.json({ status: 'ok', data: { authToken, response, existUser } })
                    } else if (!response) {
                        res.json({ status: 'ok', data: { existUser, response } });
                    }
                }
            })
        }
    }).catch(err => {
        res.json({ status: 'error', data: 'Something went wrong' })
    })
})

router.get('/dashboard', verifyToken, async (req, res) => {
    if (req && req.decodeToken) {
        await authModelSchema.findOne({ _id: req.decodeToken._id }).then((user) => {
            res.json({ status: 'ok', data: user })
        })
    }
})

router.post('/image-upload', upload.single('image'), verifyToken, async (req, res) => {
    console.log("start");

    try {
        const path = req.file?.path;
        console.log(path, "lllllllllllllllllllllll");
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(path, (err, res) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("upload image error");
                }
                resolve(res.secure_url);
            });
        });

        await authModelSchema.updateOne(
            { _id: req.decodeToken._id },
            {
                $set: {
                    image: result,
                },
            }
        )
            .then((data) => {
                res.json({ url: result, status: 'ok', message: "the upload of the file was a sucess" });
            })
            .catch((err) => {
                res.json({ status: false, message: "failure occured" });
            });

    } catch (err) {
        console.log("start cat");
        console.log(err);
        res.json({ status: false, message: "error occoured", error: err });
    }
})


router.post('/register', async (req, res) => {
    const registerUserData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        gender: req.body.gender,
        dob: req.body.dob,
        status: true
    }

    const salt = await bcrypt.genSalt(10);
    await bcrypt.hash(req.body.password, salt).then((hashedPassword) => {
        if (hashedPassword) {
            registerUserData.password = hashedPassword
        }
    })
    await authModelSchema.create(registerUserData).then((userStoredData) => {
        if (userStoredData && userStoredData._id) {
            console.log("stored");
            res.json({ status: 'ok', data: userStoredData });
        }
    }).catch((err) => {
        if (err) {
            res.json({ status: "Error", data: err });
        }
    })

})

module.exports = router;