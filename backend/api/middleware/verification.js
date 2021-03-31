require("dotenv").config();

const webToken = require("jsonwebtoken");

// Constants
const _MANAGER_ROLE_ID = 3;
const _COORDINATOR_ROLE_ID = 2
const _GW_GROUP_ROLE_ID = [1, 2, 3, 4]
const _ADMIN_ROLE = "admin"
const env = process.env

/** 
 * @description Middleware validation for admin
 * @params null
 * @return next()
 */
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
  webToken.verify(token, env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        message: "Session expired! Please login",
      });
    // If the account's role_name is not "admin" or undefined return 401
    else if (!data.userInfo.role_name || data.userInfo.role_name != _ADMIN_ROLE) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Admin permission required",
      });
    }
    // Pass the data to API
    res.locals.data = data;
    next();
  });
};

/** 
 * @description Middleware validation for manager
 * @params null
 * @return next()
 */
const managerValidation = (req, res, next) => {
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
  webToken.verify(token, env.ACCESS_TOKEN_SECRET, (err, data) => {
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
        message: "Manager permission required",
      });
    } else {
      res.locals.data = data;
      next();
    }
  });
};

/** 
 * @description Middleware validation for coordinator
 * @params null
 * @return next()
 */
 const coordinatorValidation = (req, res, next) => {
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
  webToken.verify(token, env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        message: "Session expired! Please login",
      });
    // If the user permission is not manager, throw the 401 error to prevent unauthorised access
    if (data.userInfo.FK_role_id !== _COORDINATOR_ROLE_ID) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Coordinator permission required",
      });
    } else {
      res.locals.data = data;
      next();
    }
  });
};


/** 
 * @description Middleware validation for manager, coordinator and student
 * @params null
 * @return next()
 */
const gwAccountValidation = (req, res, next) => {
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
  webToken.verify(token, env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        message: "Session expired! Please login",
      });
    // If the user is unrelated to Greenwich, throw the 401 error to prevent unauthorised access
    console.log("info: ", data);
    if (!data.userInfo.FK_role_id && !_GW_GROUP_ROLE_ID.includes(data.userInfo.FK_role_id || data.userInfo.faculty_id)) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Permission required",
      });
    } else {
      res.locals.data = data;
      next();
    }
  });
};

/** 
 * @description Middleware validation for guest and admin
 * @params null
 * @return next()
 */
 const accessValidation = (req, res, next) => {
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
  webToken.verify(token, env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        message: "Session expired! Please login",
      });
    // If the user permission is not admin/guest, throw the 401 error to prevent unauthorised access
    res.locals.data = data;
    next();
  });
};


// ====================================================== Test code

const studentValidation = (req, res, next) => {
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
  webToken.verify(token, env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err)
      return res.status(403).json({
        status: res.statusCode,
        success: false,
        message: "Session expired! Please login",
      });
    // If the user permission is not student, throw the 401 error to prevent unauthorised access
    res.locals.data = data;
    console.log("qua verifi func");
    next();
  });
};

module.exports = {
  adminValidation: adminValidation,
  studentValidation: studentValidation,
  accessValidation: accessValidation,
  managerValidation: managerValidation,
  coordinatorValidation: coordinatorValidation,
  gwAccountValidation: gwAccountValidation
};
