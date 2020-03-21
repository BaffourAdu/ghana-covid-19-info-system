import axios from "axios";
import admin from "firebase-admin"

require("dotenv").config();
const serviceAccount = require('../../ghana-covid-19-ccbdf-firebase-adminsdk-oee4i-b1741c8c48.json')

const { BASE_URL, ACCESS_TOKEN } = process.env;
const SCRAPER_LAMBDA_FUNCTION = `${BASE_URL}/ghs-scraper`;
const EMAIL_LAMBDA_FUNCTION = `${BASE_URL}/ghs-send-email-notification`;
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<YOUR-APP-URL>.firebaseio.com'
})
const db = admin.firestore()

exports.handler = async (event, context) => {
  const requestBody = JSON.parse(event.body);
  if (requestBody.access_token !== ACCESS_TOKEN)
    return { statusCode: 401, body: "Unauthorized" };
  if (event.httpMethod !== "POST")
		return { statusCode: 405, body: "Method Not Allowed" };



  try {
    const lastScraperRunRecord = await lastScraperRunResults();
		const subscribers = await firebaseEmailList();
		const subscribersEmails = subscribers.map((sub) => sub.email);
    const scraperFunctionResponse = await axios.get(SCRAPER_LAMBDA_FUNCTION);

    if (
      scraperFunctionResponse.data.number_of_cases >
      lastScraperRunRecord.number_of_cases
    ) {
      const latestStatusUpdate = scraperFunctionResponse.data.status_updates[0];
      await axios.post(EMAIL_LAMBDA_FUNCTION, {
        to: subscribersEmails,
        body: parseEmailBody(
          latestStatusUpdate.title,
          latestStatusUpdate.body_formatted,
          latestStatusUpdate.image
        )
      });
    }

		await addScraperRun(scraperFunctionResponse.data);

    return {
      statusCode: 200,
      headers,
      body: "Update Success"
    };
  } catch (error) {
    console.log({ error });
    return { statusCode: 422, headers, body: String(error) };
  }

};

async function firebaseEmailList() {
	try{
		const subscriberList = []
		const subscribers = await db.collection('subscribers').get();
		subscribers.forEach((doc) => {
			subscriberList.push(doc.data())
		});
		return subscriberList;
	} catch (error) {
	console.log({ error });
	return { statusCode: 422, headers, body: String(error) };
	}
}


async function addScraperRun(data) {
	try{
		const log = {...data, timestamp: admin.firestore.Timestamp.now()}
		await db.collection('logs').add(log);
	} catch (error) {
	console.log({ error });
	return { statusCode: 422, headers, body: String(error) };
	}
}

function  parseEmailBody(title, body, image) {
  return `
        <h3>${title}</h3><p>${body}</p> ${image ? `<img src="${image}">` : ``}
    `;
}


async function lastScraperRunResults() {
	const lastCase = [];
	const cases = await db.collection('logs').orderBy('timestamp').limit(5).get();
	// Get the last document
	cases.forEach((doc) => {
		lastCase.push(doc.data())
	});
	return lastCase[lastCase.length - 1];
}
