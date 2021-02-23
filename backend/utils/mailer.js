const nodemailer = require("nodemailer");

// Import Node mailer configuration
const { mailerConfig } = require("./mailerconfig");

// Create the transporter with service configuration
const transporter = nodemailer.createTransport(mailerConfig);

// Create function sendMail that receive email and otp code
const sendMail = (email, receiverEmail) => {
  const details = {
    from: "vuatrochoi.theblue@gmail.com", // The mail used to send the OTP code
    to: email, // The receiver email
    subject: "New post submitted to @web: ", // Content of the mail
    html: email + " has submitted new post. Click the url to check: @link",
  };
  // Send mail
  transporter.sendMail(details, function (error, data) {
    if (error) console.log(error);
    else console.log(data);
  });
  
};

module.exports = sendMail;
