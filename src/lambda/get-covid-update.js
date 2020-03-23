import axios from "axios";
import {
  getSubscribersEmailList,
  getlastScraperRunResults,
  storeScraperRunResults,
  parseEmailBody
} from "../helpers/index";
import { isEqual } from "lodash";

require("dotenv").config();

const { BASE_URL, ACCESS_TOKEN } = process.env;
const SCRAPER_LAMBDA_FUNCTION_URL = `${BASE_URL}/ghs-scraper`;
const EMAIL_LAMBDA_FUNCTION_URL = `${BASE_URL}/ghs-send-email-notification`;
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

exports.handler = async (event, context) => {
  // const requestBody = JSON.parse(event.body);
  // if (requestBody.access_token !== ACCESS_TOKEN)
  //   return { statusCode: 401, body: "Unauthorized" };
  if (event.httpMethod !== "GET")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const lastScraperRunRecord = await getlastScraperRunResults();
    const subscribersEmails = await getSubscribersEmailList();
    const scraperFunctionResponse = await axios.get(
      SCRAPER_LAMBDA_FUNCTION_URL
    );
    const latestStatusUpdate = scraperFunctionResponse.data.status_updates[0];

    if (
      !isEqual(
        scraperFunctionResponse.data.ghana_stats,
        lastScraperRunRecord.ghana_stats
      ) |
      (latestStatusUpdate.body_formatted !==
        lastScraperRunRecord.status_updates[0].body_formatted)
    ) {
      await axios.post(EMAIL_LAMBDA_FUNCTION_URL, {
        to: subscribersEmails,
        body: parseEmailBody(
          latestStatusUpdate.title,
          latestStatusUpdate.body_formatted,
          latestStatusUpdate.image,
          scraperFunctionResponse.data.ghana_stats,
          scraperFunctionResponse.data.global_stats
        )
      });
    }

    const logResponse = await storeScraperRunResults(
      scraperFunctionResponse.data
    );
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
