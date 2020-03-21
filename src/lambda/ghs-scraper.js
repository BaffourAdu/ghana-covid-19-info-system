import axios from "axios";
import cheerio from "cheerio";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};
const GHS_WEBSITE_URL = "https://ghanahealthservice.org/covid19/";

exports.handler = async (event, context) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // fetch website html
    const response = await axios.get(GHS_WEBSITE_URL);
    let status_updates = [];

    // load website html
    const $ = cheerio.load(response.data);

    // Get number of cases
    const number_of_cases = $(".widget-box-content", ".widget-box")
      .filter(index => index === 1)
      .find("span")
      .text();

    // Get last case time details
    const last_update_of_cases_formatted = $(".widget-box-title", ".widget-box")
      .filter(index => index === 2)
      .text()
      .replace(/as at\s/g, "")
      .replace(/G.*$/g, "");
    const last_update_of_cases_date = last_update_of_cases_formatted
      .replace(/\|.*$/g, "")
      .trim();
    const last_update_of_cases_time = last_update_of_cases_formatted
      .replace(/^.*\|/g, "")
      .trim();

    // Get cases status updates
    $(".widget-box-status-content").each(function(index, element) {
      const content = $(this)
        .find(".widget-box-status-text")
        .text();
      status_updates.push({
        title: $(this)
          .find(".user-status-title")
          .text(),
        body_formatted: content.replace(/\r?\n|\r/g, "<br>").trim(),
        body_raw: content.replace(/\r?\n|\r/g, "").trim(),
        image: $(this).is(".widget-box-picture")
          ? $(this)
              .find(".widget-box-picture")
              .find("img")
              .attr("src")
          : null
      });
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        number_of_cases,
        last_update_of_cases_formatted,
        last_update_of_cases_date,
        last_update_of_cases_time,
        status_updates
      })
    };
  } catch (error) {
    console.log({ error });
    return { statusCode: 422, headers, body: String(error) };
  }
};
