import axios from "axios";
import { storeSubscriber, getlastScraperRunResults, parseEmailBody} from "../helpers/index"

require("dotenv").config();

const { BASE_URL, ACCESS_TOKEN } = process.env;
const EMAIL_LAMBDA_FUNCTION = `${BASE_URL}/ghs-send-email-notification`;
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

exports.handler = async (event, context) => {
  const requestBody = JSON.parse(event.body);
  // if (requestBody.access_token !== ACCESS_TOKEN)
  //   return { statusCode: 401, body: "Unauthorized" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const lastScraperRunRecord = await getlastScraperRunResults();
    const latestStatusUpdate = lastScraperRunRecord.status_updates[0];

    if (requestBody.email) {
      await axios.post(EMAIL_LAMBDA_FUNCTION, {
        to: requestBody.email.split(" "),
        body: parseEmailBody(
          latestStatusUpdate.title,
          latestStatusUpdate.body_formatted,
          latestStatusUpdate.image,
          lastScraperRunRecord.ghana_stats,
          lastScraperRunRecord.global_stats
        )
      });
    }
    
    const subscriberResponse = await storeSubscriber(requestBody);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Subscriber added successfully!"
      })
    };
  } catch (error) {
    console.log({ error });
    return { statusCode: 422, headers, body: String(error) };
  }
};
