const nodemailer = require("nodemailer");

// Import Node mailer configuration
const { mailerConfig } = require("./config/mailerconfig");

// Create the transporter with service configuration
const transporter = nodemailer.createTransport(mailerConfig);

/** 
 * @description function sendMail() to notify the coordinator if new submission is posted
 * @params 
 *      - coordinatorEmail: String
 *      - studentEmail: String
 *      - eventInfo: Object
 *      - facultyInfo: Object
 * @return
 *      
 * @notes 
 */
const sendMail = (coordinatorEmail, studentEmail, eventInfo) => {
  const details = {
    from: "vuatrochoi.theblue@gmail.com", // The mail used to send the OTP code
    to: coordinatorEmail, // The coordinator email
    subject: `New article submitted to ${eventInfo.event_title}.`, // Content of the mail
    html: studentEmail + ` has submitted new post. Click the url to check: https://gw-magazine.site/api/events/${eventInfo.event_id}/submitted-articles`,
  };
  // Send mail
  transporter.sendMail(details, function (error, data) {
    if (error) console.log(error);
    else console.log(data);
  });
  
};

module.exports = sendMail;
