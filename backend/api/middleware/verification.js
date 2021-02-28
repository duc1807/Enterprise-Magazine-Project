require("dotenv").config();

const webToken = require("jsonwebtoken");

const _MANAGER_ROLE_ID = 3;
const _GW_GROUP_ROLE_ID = [1, 2, 3]

const loginValidation = (req, res, next) => {
  // Retrieve the token from cookies
  const token = req.cookies["Token"];
  // If the token is not existed, throw 401 error
  if (!token) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      path: "/",
      message: "Please login",
    });
  }
  // Check if the token is not valid | expired, throw 401 error if true
  webToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        path: "/",
        message: "Session expired! Please login",
      });
    // If the user permission is not admin, throw the 401 error to prevent unauthorised access
    res.locals.data = data;
    console.log("Passed verify middleware");
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
      message: "Please login",
    });
  }
  // Check if the token is not valid | expired, throw 401 error if true
  webToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        message: "Session expired! Please login",
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
      message: "Please login",
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
        message: "Session expired! Please login",
      });
    // If the user permission is not admin, throw the 401 error to prevent unauthorised access
    res.locals.data = data;
    console.log("qua verifi func");
    next();
  });
};

const managerValidation = (req, res, next) => {
  // Retrieve the token from cookies
  const token = req.cookies["Token"];
  // If the token is not existed, throw 401 error
  if (!token) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      // path: "/",
      message: "Please login",
    });
  }
  // Check if the token is not valid | expired, throw 401 error if true
  webToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        message: "Session expired! Please login",
      });
    // If the user permission is not manager, throw the 401 error to prevent unauthorised access
    if (data.userInfo.FK_role_id !== _MANAGER_ROLE_ID) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        // path: "/",
        message: "Manager permission required",
      });
    } else {
      res.locals.data = data;
      console.log("Passed verify middleware");
      next();
    }
  });
};

const gwAccountValidation = (req, res, next) => {
  // Retrieve the token from cookies
  const token = req.cookies["Token"];
  // If the token is not existed, throw 401 error
  if (!token) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      // path: "/",
      message: "Please login",
    });
  }
  // Check if the token is not valid | expired, throw 401 error if true
  webToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        message: "Session expired! Please login",
      });
    // If the user permission is not manager, throw the 401 error to prevent unauthorised access
    if (!_GW_GROUP_ROLE_ID.includes(data.userInfo.FK_role_id)) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        // path: "/",
        message: "Permission required",
      });
    } else {
      res.locals.data = data;
      console.log("Passed verify middleware");
      next();
    }
  });
};

module.exports = {
  adminValidation: adminValidation,
  studentValidation: studentValidation,
  loginValidation: loginValidation,
  managerValidation: managerValidation,
  gwAccountValidation: gwAccountValidation
};
