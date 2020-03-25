import axios from "axios";
import cheerio from "cheerio";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};
const GHS_WEBSITE_URL = "https://ghanahealthservice.org/covid19/";
axios.defaults.timeout = 7000;

exports.handler = async (event, context) => {
  if (event.httpMethod !== "GET")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    // fetch website html
    const response = await axios.get(GHS_WEBSITE_URL);
    let status_updates = [];
		let ghana_stats = [];
		let global_stats = [];
		let last_update_of_ghana_cases_formatted = "";
		let last_update_of_global_cases_formatted = "";

    // load website html
		const $ = cheerio.load(response.data);
		// Get Global Case Stats
		const GlobalStatsContentBox = $(".widget-box-content", ".widget-box").filter(index => index === 4);
    // Get Ghana Case Stats
		const GhanaStatsContentBox = $(".widget-box-content", ".widget-box").filter(index => index === 2);
		const GhanaConfirmedCasesContentBox = $(".widget-box-content", ".widget-box").filter(index => index === 1);

		ghana_stats.push({ 
			title: "Confirmed", 
			count:  $("div", GhanaConfirmedCasesContentBox).find('span').text()
		});


		$(".information-line", GhanaStatsContentBox).each(function(
      index,
      element
    ) {
			console.log($(this)
			.find(".information-line-text")
			.text())
      if (index == 4) {
				last_update_of_ghana_cases_formatted = $(this)
        .find(".information-line-text")
				.text()
				.replace(/G.*$/g, "");;
				return false;
			}
      const title = $(this)
        .find(".information-line-title")
        .text();
      const count = $(this)
        .find(".information-line-text")
        .text();
      ghana_stats.push({ title, count });
		});
		
		// Get Global Case Stats
		$(".information-line", GlobalStatsContentBox).each(function(
      index,
      element
    ) {
      if (index == 4) {
				last_update_of_global_cases_formatted = $(this)
        .find(".information-line-text")
				.text()
				.replace(/G.*$/g, "");;
				return false;
			}
      const title = $(this)
        .find(".information-line-title")
        .text();
      const count = $(this)
        .find(".information-line-text")
        .text();
			global_stats.push({ title, count });
    });

    // Get last case time details
    const last_update_of_ghana_cases_date = last_update_of_ghana_cases_formatted
      .replace(/\|.*$/g, "")
      .trim();
    const last_update_of_ghana_cases_time = last_update_of_ghana_cases_formatted
      .replace(/^.*\|/g, "")
			.trim();
			
		const last_update_of_global_cases_date = last_update_of_global_cases_formatted
      .replace(/\|.*$/g, "")
      .trim();
    const last_update_of_global_cases_time = last_update_of_global_cases_formatted
      .replace(/^.*\|/g, "")
      .trim();

    // Get cases status updates
    $(".widget-box-status-content").each(function(index, element) {
      const content = $(this)
        .find(".widget-box-status-text")
        .text();
      const image_url = $(this)
        .find(".widget-box-picture")
        .find("img")
        .attr("src");
      status_updates.push({
        title: $(this)
          .find(".user-status-title")
          .text(),
        body_formatted: content.replace(/\r?\n|\r/g, "<br>").trim(),
        body_raw: content.replace(/\r?\n|\r/g, "").trim(),
        image: image_url
          ? image_url.replace(/^/, "https://ghanahealthservice.org/covid19/")
          : null
      });
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
				ghana_stats,
				global_stats,
        last_update_of_ghana_cases_formatted,
        last_update_of_ghana_cases_date,
				last_update_of_ghana_cases_time,
				last_update_of_global_cases_formatted,
				last_update_of_global_cases_date,
				last_update_of_global_cases_time,
        status_updates
      })
    };
  } catch (error) {
		// console.log({ error });
		if (error.status === 408 || error.code === 'ECONNABORTED') {
			return { statusCode: 500, headers, body: `A timeout happend on url ${error.config.url}` };
    }
    return { statusCode: 422, headers, body: String(error) };
  }
};
