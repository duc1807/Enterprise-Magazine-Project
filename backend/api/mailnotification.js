const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { google, Auth } = require("googleapis");

const { getAuthClient, getUserProfile, getAuthUrl } = require("../utils/auth");
const sendMail = require('../utils/mailer');

router.get('/newsubmission', async(req,res) => {
    let userProfile = undefined
    await getUserProfile().then(data => {
        userProfile = data
    }).catch(err => console.log(err))

    console.log("User profile: ", userProfile)
    // sendMail(userProfile.email, "hihi")
})

module.exports = router