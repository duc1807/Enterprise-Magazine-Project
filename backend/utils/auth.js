const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
require("dotenv").config();

const { google } = require("googleapis");

const OAuth2Data = require("../credentials.json");

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URI = OAuth2Data.web.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

module.exports.getAuthUrl = () => {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const SCOPES =
    "https://www.googleapis.com/auth/drive.file " +
    "https://www.googleapis.com/auth/userinfo.profile";
  var url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  return url;
};

module.exports.getAuthClient = () => {
  return oAuth2Client;
};

module.exports.getUserProfile = () => {
  return new Promise((resolve, reject) => {
    const oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });
  
    oauth2.userinfo.get((err, response) => {
      if (err) throw err; // Send 404 err  
      resolve(response.data);
    });
  })
  
};
