const mailjet = require('node-mailjet');

const client = mailjet.apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

function sendEmail(toEmail, subject, textContent, htmlContent) {
  return client.post("send", { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: "narike@gmail.com",
          Name: "NodeJS Course",
        },
        To: [
          {
            Email: toEmail,
          }
        ],
        Subject: subject,
        TextPart: textContent,
        HTMLPart: htmlContent,
      }
    ]
  });
}

module.exports = sendEmail;
