require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
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

const getAuthUrl = () => {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const SCOPES =
    "https://www.googleapis.com/auth/drive.file"
    + " https://www.googleapis.com/auth/userinfo.profile"
    + " https://www.googleapis.com/auth/drive.metadata.readonly"
    + " https://www.googleapis.com/auth/userinfo.email"
    // + " https://www.googleapis.com/auth/gmail.readonly"
    // + "https://www.googleapis.com/auth/drive.metadata";
  var url = oAuth2Client.generateAuthUrl({
    access_type: "online",
    scope: SCOPES,
  });
  return url;
};

const getAuthClient = () => {
  return oAuth2Client;
};

const getUserProfile = () => {
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

module.exports = {
  getAuthClient: getAuthClient,
  getUserProfile: getUserProfile,
  getAuthUrl: getAuthUrl
}
