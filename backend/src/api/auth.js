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

module.exports.getAuthClient = () => {
  if (!oAuth2Client) return oAuth2Client;
};

module.exports.setAuthClient = () => {
  var oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  return oAuth2Client;
};
