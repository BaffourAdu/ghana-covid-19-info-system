import axios from "axios";
import admin from "firebase-admin";

require("dotenv").config();

const { BASE_URL, ACCESS_TOKEN } = process.env;
const SCRAPER_LAMBDA_FUNCTION = `${BASE_URL}/ghs-scraper`;
const EMAIL_LAMBDA_FUNCTION = `${BASE_URL}/ghs-send-email-notification`;
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "ghana-covid-19-ccbdf",
    private_key_id: "b1741c8c483cee9fa27ed7d380b0b15f7af546bb",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDLgRv+ZGab8COK\nB0q61VsnPS4/jDBzIUZuJP5GDsARmuu3uHnuQIyhp3YBP//K4ZWWM2Yv6uutKS8m\n4oLrIqYoJD13iHlANGFCbJ/AtWvQ2UL2cctTlgksdLIaVNjohNVRaf2h663rnadG\nmhhq7FCSeFJFmxMURg8BJNudfQfNoAbTY5mXLD5Hd3c1GXg9xSPghtAYazeGveeR\nSgOn0QNofmHBDrMwtNm18z3Qvvbruo4wrpnf+EQEUg8aN0Q2gnyhXJyyNtzjIyQQ\nyNCA4xv1YBz5ELJ2e6fguGScK1FMKnNGGwipYH891RJmICfxaNblKPCAMQjk0PFm\nk1CZqc+DAgMBAAECggEAArZeUqYw7ewl9R2Cw/m7BMtede9e5/HuF+K7VuC0c6ee\nc6zsRx4qIa9zNbIOLTyTe1SFDKdza7PsUnbbatnj4A4XmaPChfYMw89h07Y3USnM\nKC+9F4ic57BIfWxbFcJLe5HPlRxojYbk515/a9Fpg4JCCnZ2KyOB6LB+kttLQtTU\nmBpSHWscko8rTrahgl98w+zm7QvKGrtUGPZJxk58aeY+rkrCI4F7oJuUCDOtaruv\nHolJXPrJgH+16Hp30db5ytEAl714JxPSKTo+4Ynamo5991ZKx+2q1can8WiCWCKv\nLnqqf8l5dfob23XP5cL5wVumBQ5Us6Dpj1d2LOqIaQKBgQD2xOk+5uT2fv+WemYt\npXEqiWORDJM0IV6XDOr8aX6myC424f3tgCjN2H78g7YovvwhIVc36OcmrWCcEBAi\nKarKKPVBME/1hY7GQLd4vr9BO1M+n5xCVD6EXp6QDZ8eoWrY/4SL+fNmBPjS5n/o\n3evhN5nJFM3SfJQwXjSzl/TvWQKBgQDTHeOmhk1wB9kSJYs4t2UUCSGICW+ih2N3\ntCz9Zc9wlr3mbYRpADo9XjMm15jQ/DXlmGGF72cjHgZI7Z1NCrRX0yuY1dl0LH9X\nf1pu0/LekBzVm3egkqXV3DlFhJjfZEF866IR36UAw8HF/8vPPzF8+vV4+wmaW3SH\nhApZfS0WOwKBgQCGakfqvXZmVlL+MnnJz15PHzse3Uypjqupd53gE86rJksWFg9s\n+OxBA/ZXsZ7dnvpTSYfqqnCOfs4q9Az1ruCa8ah188z6Hd/hWYsWuEARVjFH4UUK\nVD0heTDBosnTs3Ux8izO2j2cioTGzEtMGuXLba/U+gIK71UA66+lS9ZdMQKBgCID\nm80VsF5PdWLeF6tAqRFsUzG2y3y1MYp0xhbhk2WBdAEvPfko5zlB9x3X+LAbIpfm\nUDgjFUvsJ3kSh5iFE/9eb5TFR67XCIFRbIGUtnmzYGHuFX0Sg5OMUtHnhjXf0klN\nMaSNkuknoQ3Eo9K1TMTlLi2azLZI6+J1nLFEYMJHAoGAC6gZyh8HrtQPPaR0QSvY\nUU5CLXanMiQaq12sWPlsE+QQvIfhNxXq0LLDJXOxV40yJ2Te2QG9zNtNyR9RYvpw\nbP1qklR14hFI0QJJ8LofNOTkHztjBVHb2rWDUj7mSngN74EMPMHhJBtkHvFT3L5z\n6EwDEjeR+2zPsq6KKmhLGVw=\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-oee4i@ghana-covid-19-ccbdf.iam.gserviceaccount.com",
    client_id: "100162469805699925580",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-oee4i%40ghana-covid-19-ccbdf.iam.gserviceaccount.com"
  }),
  databaseURL: "https://<YOUR-APP-URL>.firebaseio.com"
});
const db = admin.firestore();

exports.handler = async (event, context) => {
  const requestBody = JSON.parse(event.body);
  if (requestBody.access_token !== ACCESS_TOKEN)
    return { statusCode: 401, body: "Unauthorized" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const lastScraperRunRecord = await lastScraperRunResults();
    const subscribers = await firebaseEmailList();
		const subscribersEmails = subscribers.map(sub => sub.email);
		const scraperFunctionResponse = await axios.get(SCRAPER_LAMBDA_FUNCTION);
		
		console.log({subscribersEmails})
		console.log(scraperFunctionResponse.data.number_of_cases, lastScraperRunRecord.number_of_cases)

    if (
      scraperFunctionResponse.data.number_of_cases >
      lastScraperRunRecord.number_of_cases
    ) {
			console.log("Sending update emails")
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
  try {
    const subscriberList = [];
    const subscribers = await db.collection("subscribers").get();
    subscribers.forEach(doc => {
      subscriberList.push(doc.data());
    });
    return subscriberList;
  } catch (error) {
    console.log({ error });
    return { statusCode: 422, headers, body: String(error) };
  }
}

async function addScraperRun(data) {
  try {
    const log = { ...data, timestamp: admin.firestore.Timestamp.now() };
    await db.collection("logs").add(log);
  } catch (error) {
    console.log({ error });
    return { statusCode: 422, headers, body: String(error) };
  }
}

function parseEmailBody(title, body, image) {
  return `
        <h3>${title}</h3><p>${body}</p> ${image ? `<img src="${image}">` : ``}
    `;
}

async function lastScraperRunResults() {
  const lastCase = [];
  const cases = await db
    .collection("logs")
    .orderBy("timestamp")
    .limit(5)
    .get();
  // Get the last document
  cases.forEach(doc => {
    lastCase.push(doc.data());
  });
  return lastCase[lastCase.length - 1];
}
