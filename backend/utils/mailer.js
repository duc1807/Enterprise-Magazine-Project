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
    html:
      studentEmail +
      ` has submitted new post. Click the url to check: https://gw-magazine.site/api/events/${eventInfo.event_id}/submitted-articles`,
  };
  // Send mail
  transporter.sendMail(details, function (error, data) {
    if (error) console.log(error);
    else console.log(data);
  });
};

/**
 * @description function send warning mail to notify the manager if problem in creating new semester
 * @params
 *      - managersEmail: Array[]
 *      - yearError: Int ???
 *      - GW_STORAGE_FOLDER_ID: String
 * @return
 * @notes
 */
const sendWarningMailToMultipleAccounts = (managersEmail, yearError, GW_STORAGE_FOLDER_ID) => {
  managersEmail.map((managerEmail) => {
    const details = {
      from: "vuatrochoi.theblue@gmail.com", // The mail used to send the OTP code
      to: managerEmail, // The coordinator email
      subject: `Warning: Drive error in creating new semester of ${yearError}.`, // Content of the mail
      html: `Click the url to check: https://drive.google.com/drive/u/0/folders/${GW_STORAGE_FOLDER_ID}`,
    };

    // Send mail
    transporter.sendMail(details, function (error, data) {
      if (error) console.log(error);
      else console.log(data);
    });
  });
};

module.exports = {
  sendMail,
  sendWarningMailToMultipleAccounts,
};
