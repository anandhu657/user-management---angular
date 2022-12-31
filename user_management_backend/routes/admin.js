const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const ObjId = require('mongodb').ObjectId;
const adminModelSchema = require('../models/adminModel');
const authModelSchema = require('../models/authModel');

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    await adminModelSchema.findOne({ email: email }).then(existAdmin => {
        if (existAdmin && existAdmin._id) {
            bcrypt.compare(password, existAdmin.password, (err, response) => {
                if (!err) {
                    res.json({ status: "ok", data: { existAdmin, response } })
                } else {
                    res.json({ status: "error", data: { existAdmin, response } })
                }
            })
        }
    }).catch(err => {
        res.json({ status: "Error", data: "something went wrong" })
    })
})

router.get('/dashboard', async (req, res) => {
    let users = await authModelSchema.find()
    res.json(users)
})

router.post('/deleteUser', async (req, res) => {
    console.log(req.body);
    const user = req.body._id;
    await authModelSchema.deleteOne({ _id:new ObjId(user) })
        .then((data) => {
            console.log(data);
            res.json({ status: true, message: "deleted the user", data });
        })
        .catch((err) => {
            res.json({ status: false, message: "failed to delete the user", error: err });
        });
})

router.get('/doUserSearch', async(req, res) => {
    const name = req.query.name;
    await authModelSchema.find({ username: { $regex: name } }).then((data) => {
        res.json({ data });
    });
})

module.exports = router