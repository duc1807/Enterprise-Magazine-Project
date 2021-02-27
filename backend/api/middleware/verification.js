require("dotenv").config();

const webToken = require("jsonwebtoken");

const loginValidation = (req, res, next) => {
  // Retrieve the token from cookies
  const token = req.cookies["Token"];
  // If the token is not existed, throw 401 error
  if (!token) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      path: "/",
      messenger: "Please login",
    });
  }
  // Check if the token is not valid | expired, throw 401 error if true
  webToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        path: "/",
        messenger: "Session expired! Please login",
      });
    // If the user permission is not admin, throw the 401 error to prevent unauthorised access
    res.locals.data = data;
    console.log("Passed verify middleware")
    next();
  });
};


const adminValidation = (req, res, next) => {
  // Retrieve the token from cookies
  const token = req.cookies["Token"];
  // If the token is not existed, throw 401 error
  if (!token) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      role: "admin",
      path: "/",
      messenger: "Please login",
    });
  }
  // Check if the token is not valid | expired, throw 401 error if true
  webToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        role: "admin",
        path: "/",
        messenger: "Session expired! Please login",
      });
    // If the user permission is not admin, throw the 401 error to prevent unauthorised access
    res.locals.data = data;
    next();
  });
};

const studentValidation = (req, res, next) => {
  // Retrieve the token from cookies
  const token = req.cookies["Token"];
  // If the token is not existed, throw 401 error
  if (!token) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      role: "student",
      path: "/",
      messenger: "Please login",
    });
  }
  // Check if the token is not valid | expired, throw 401 error if true
  webToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        role: "student",
        path: "/",
        messenger: "Session expired! Please login",
      });
    // If the user permission is not admin, throw the 401 error to prevent unauthorised access
    res.locals.data = data;
    console.log("qua verifi func")
    next();
  });
};

module.exports = {
  adminValidation: adminValidation,
  studentValidation: studentValidation,
  loginValidation: loginValidation
};
