require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");

const { accessValidation } = require("../middleware/verification");



module.exports = router
