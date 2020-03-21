import sendgridMail from "@sendgrid/mail";

require("dotenv").config();

const { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } = process.env;
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

const msg = {
  to: "",
  from: SENDGRID_FROM_EMAIL,
  subject: "COVID-19 Update from Ghana Health Service",
  html: "",
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const requestBody = JSON.parse(event.body);
  sendgridMail.setApiKey(SENDGRID_API_KEY);
  msg.to = requestBody.to;
  msg.html = requestBody.body;

  try {
    await sendgridMail.sendMultiple(msg);
    return {
      statusCode: 200,
      headers,
      body: "Email queued successfully"
    };
  } catch (error) {
    console.log({ error });
    return { statusCode: 422, headers, body: String(error) };
  }
};
