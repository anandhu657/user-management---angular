const express = require('express');
const app = express();
const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost/userdata";
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin')
const cors = require('cors');
const bodyParser = require('body-parser')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/auth', authRouter);
app.use('/admin', adminRouter);

mongoose.connect(mongoURI);
mongoose.connection.on('open', () => {
    console.log('Database connected successfully');
})

app.listen(3000, (err) => {
    !err ? console.log('App is listen.... 3000') : console.log("Database not connected");
})
