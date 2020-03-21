import axios from "axios";

require("dotenv").config();

const { BASE_URL, ACCESS_TOKEN } = process.env;
const SCRAPER_LAMBDA_FUNCTION = `${BASE_URL}/ghs-scraper`;
const EMAIL_LAMBDA_FUNCTION = `${BASE_URL}/ghs-send-email-notification`;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

exports.handler = async (event, context) => {
  const requestBody = JSON.parse(event.body);
  if (requestBody.access_token !== ACCESS_TOKEN)
    return { statusCode: 401, body: "Unauthorized" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const lastScraperRunRecord = lastScraperRunResults();
    const firebaseEmails = firebaseEmailList();
    const scraperFunctionResponse = await axios.get(SCRAPER_LAMBDA_FUNCTION);

    if (
      scraperFunctionResponse.data.number_of_cases >
      lastScraperRunRecord.number_of_cases
    ) {
      const latestStatusUpdate = scraperFunctionResponse.data.status_updates[0];
      await axios.post(EMAIL_LAMBDA_FUNCTION, {
        to: firebaseEmails,
        body: parseEmailBody(
          latestStatusUpdate.title,
          latestStatusUpdate.body_formatted,
          latestStatusUpdate.image
        )
      });
    }

    // TODO: Update Firebase

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

function parseEmailBody(title, body, image) {
  return `
        <h3>${title}</h3><p>${body}</p> ${image ? `<img src="${image}">` : ``}
    `;
}
function firebaseEmailList() {
  // TODO: Pull Email list from firebase
  return ["baffouraduboampong@gmail.com", "akotoro22@gmail.com"];
}

function lastScraperRunResults() {
  // TODO: Pull from firebase
  return {
    number_of_cases: "15",
    last_update_of_cases_formatted: "20th March, 2020 | 17:05",
    last_update_of_cases_date: "20th March, 2020",
    last_update_of_cases_time: "17:05",
    status_updates: [
      {
        title:
          "Confirmed Cases Of COVID-19 In Ghana Rises To Sixteen (16) As At 20 March 2020 - 09:45GMT",
        body_formatted:
          "<br>            <br>            Five (5) new confirmed cases on the 19th March 2020. All five were reported from Greater Accra Region. <br>--- 29-year-old Ghanaian lady; resident of Accra; no history of travel; sample confirmed positive in the laboratory<br>--- 34-year-old Ghanaian lady resident of Accra; contact of a confirmed case at place of work; sample confirmed positive in the laboratory<br>--- 53-year-old Ghanaian male, resident of Tema; no history of travel, no evidence of close contact with confirmed case; sample confirmed positive in the laboratory<br>--- 41-year-old Ghanaian male; arrived in Ghana by KLM on the 15 March 2020; indicated exposure with family members in Amsterdam exhibiting respiratory symptoms and also on the flight with some passengers sneezing and coughing; sample confirmed positive in the laboratory.<br>--- 36-year-old Ghanaian male; resident of Paris, France; date of arrival in Ghana unconfirmed; no evidence of contact with infected person; <br>This brings to a total of sixteen (16) confirmed cases in Ghana, with no death.<br><br>Contact tracing has been initiated in all these confirmed cases. <br><br>",
        body_raw:
          "Five (5) new confirmed cases on the 19th March 2020. All five were reported from Greater Accra Region. --- 29-year-old Ghanaian lady; resident of Accra; no history of travel; sample confirmed positive in the laboratory--- 34-year-old Ghanaian lady resident of Accra; contact of a confirmed case at place of work; sample confirmed positive in the laboratory--- 53-year-old Ghanaian male, resident of Tema; no history of travel, no evidence of close contact with confirmed case; sample confirmed positive in the laboratory--- 41-year-old Ghanaian male; arrived in Ghana by KLM on the 15 March 2020; indicated exposure with family members in Amsterdam exhibiting respiratory symptoms and also on the flight with some passengers sneezing and coughing; sample confirmed positive in the laboratory.--- 36-year-old Ghanaian male; resident of Paris, France; date of arrival in Ghana unconfirmed; no evidence of contact with infected person; This brings to a total of sixteen (16) confirmed cases in Ghana, with no death.Contact tracing has been initiated in all these confirmed cases.",
        image: null
      },
      {
        title: "Self-Quarantine - 19th ,March, 2020 : 21:20GMT",
        body_formatted: "<br>            <br>",
        body_raw: "",
        image:
          "https://ghanahealthservice.org/covid19/img/our-imgs/covid_19_quanratine_2.jpg"
      },
      {
        title:
          "Confirmed Cases Of COVID-19 In Ghana Rises To Eleven (11) As At 19 March 2020 - 15:00GMT",
        body_formatted:
          "<br>            <br>            On 19 March 2020, we received notification from KCCR indicating two (2) newly confirmed cases in Kumasi in the Ashanti Region. <br>-The first is a 59-year-old Ghanaian woman, resident in the United Kingdom who recently returned to Ghana and currently living in Kumasi, reported to a private hospital with the history of fever (temp of 39.1 ℃ ), general malaise, cough and runny nose. Her condition was suspected to be COVID-19. Sample was subsequently collected and sent to KCCR and the report was received this early morning as positive for COVID-19. <br>-The second case is a 61-year-old Lebanese male trader and resident in Kumasi. He felt unwell and reported to a health facility with fever (temp 39.4 ℃ ), and cough. The sample tested positive for COVID-19. <br>-Both case patients are being managed in isolation and responding to treatment.<br>So far the confirmed cases in Ghana are from Turkey, Norway, Germany, France, United States of America, United Kingdom (UK) and United Arab Emirates (UAE).<br>With regards to contact tracing, a total of 399 contacts have been identified and are being followed up. Nineteen (19) of the contacts developed some forms of symptoms and samples were taken for laboratory testing. <br>We have received laboratory results for 15 of them which are all negative for COVID-19 and we are awaiting results for the four (4) others. Contact identification and tracking for the newly confirmed cases have just started. <br><br>",
        body_raw:
          "On 19 March 2020, we received notification from KCCR indicating two (2) newly confirmed cases in Kumasi in the Ashanti Region. -The first is a 59-year-old Ghanaian woman, resident in the United Kingdom who recently returned to Ghana and currently living in Kumasi, reported to a private hospital with the history of fever (temp of 39.1 ℃ ), general malaise, cough and runny nose. Her condition was suspected to be COVID-19. Sample was subsequently collected and sent to KCCR and the report was received this early morning as positive for COVID-19. -The second case is a 61-year-old Lebanese male trader and resident in Kumasi. He felt unwell and reported to a health facility with fever (temp 39.4 ℃ ), and cough. The sample tested positive for COVID-19. -Both case patients are being managed in isolation and responding to treatment.So far the confirmed cases in Ghana are from Turkey, Norway, Germany, France, United States of America, United Kingdom (UK) and United Arab Emirates (UAE).With regards to contact tracing, a total of 399 contacts have been identified and are being followed up. Nineteen (19) of the contacts developed some forms of symptoms and samples were taken for laboratory testing. We have received laboratory results for 15 of them which are all negative for COVID-19 and we are awaiting results for the four (4) others. Contact identification and tracking for the newly confirmed cases have just started.",
        image: null
      },
      {
        title:
          "Confirmed Cases Of COVID-19 In Ghana Rises To Nine (9) - 19th MARCH,2020 | 09:53GMT",
        body_formatted:
          "<br>            <br>            On the 18th March, we received another report form NMIMR indicating two (2) more confirmed cases from the Greater Accra Region. Both are imported cases. One is a 56-year-old man, a Ghanaian who travelled back to Accra from a trip to UK about a week ago. The other is a 33-year-old Ghanaian, who returned to Accra from a conference in UAE. Both cases are receiving treatment in isolation.<br>This brings to a total of nine (9) confirmed COVID-19 cases. There is no death. <br>On contact tracing, a total of 399 contacts have been identified and are being followed up. Nineteen (19) of the contacts developed some forms of symptoms and samples have taken for laboratory testing. We have received results for 15 of them which are all negative for COVID-19 and we are awaiting results for four (4) of them. <br>Currently, there is no death and all the nine (9) confirmed COVID-19 cases are being managed in isolation and are responding well to treatment.<br><br>",
        body_raw:
          "On the 18th March, we received another report form NMIMR indicating two (2) more confirmed cases from the Greater Accra Region. Both are imported cases. One is a 56-year-old man, a Ghanaian who travelled back to Accra from a trip to UK about a week ago. The other is a 33-year-old Ghanaian, who returned to Accra from a conference in UAE. Both cases are receiving treatment in isolation.This brings to a total of nine (9) confirmed COVID-19 cases. There is no death. On contact tracing, a total of 399 contacts have been identified and are being followed up. Nineteen (19) of the contacts developed some forms of symptoms and samples have taken for laboratory testing. We have received results for 15 of them which are all negative for COVID-19 and we are awaiting results for four (4) of them. Currently, there is no death and all the nine (9) confirmed COVID-19 cases are being managed in isolation and are responding well to treatment.",
        image: null
      },
      {
        title: "Self-Quarantine - 18th ,March, 2020 : 19:05GMT",
        body_formatted: "<br>            <br>",
        body_raw: "",
        image:
          "https://ghanahealthservice.org/covid19/img/our-imgs/covid_19_quanratine_1.jpg"
      },
      {
        title: "Who should be self -quarantined?",
        body_formatted:
          "<br>            <br>            1.  Travellers coming from countries/territories/areas with active transmission of COVID-19 as analysed and designated by the Ministry of Health/ Ghana Health Service (refer to the list of countries) shall be in self-quarantine for 14 days.<br>2.  Any individual who has been in close contact with a person confirmed to be having coronavirus disease should be self-quarantined for 14 days since the last contact with the confirmed case. <br>CLICK TO VIEW THE DOCUMENT<br>",
        body_raw:
          "1.  Travellers coming from countries/territories/areas with active transmission of COVID-19 as analysed and designated by the Ministry of Health/ Ghana Health Service (refer to the list of countries) shall be in self-quarantine for 14 days.2.  Any individual who has been in close contact with a person confirmed to be having coronavirus disease should be self-quarantined for 14 days since the last contact with the confirmed case. CLICK TO VIEW THE DOCUMENT",
        image: null
      },
      {
        title: "What does self-quarantine mean?",
        body_formatted:
          "<br>            <br>            This is a transparent self-restriction of persons’ activities when they are not ill with COVID-19 for the purpose of protecting unexposed members of the community from contracting the disease should any at risk person become sick. It also facilitates early detection of the disease for rapid implementation of response measures. It therefore helps to prevent the spread of the disease to close friends, relatives and community members.<br>This is particularly important for persons who are classified as close contacts of a confirmed COVID-19 case. Close contacts are individuals who have been in proximity of less than 1 meter to a confirmed case from 2 days prior to symptom onset of the case and as long as the person is symptomatic.<br>Close contacts are required to stay at their homes, hotel room or any identified accommodation without mixing with the general public or family members for 14 days since the last contact with the confirmed case.<br>Self-quarantined individuals will be followed up by surveillance officers either via phone or via physical visits (in appropriate PPEs) during the period of quarantine. <br>CLICK TO VIEW THE DOCUMENT<br>",
        body_raw:
          "This is a transparent self-restriction of persons’ activities when they are not ill with COVID-19 for the purpose of protecting unexposed members of the community from contracting the disease should any at risk person become sick. It also facilitates early detection of the disease for rapid implementation of response measures. It therefore helps to prevent the spread of the disease to close friends, relatives and community members.This is particularly important for persons who are classified as close contacts of a confirmed COVID-19 case. Close contacts are individuals who have been in proximity of less than 1 meter to a confirmed case from 2 days prior to symptom onset of the case and as long as the person is symptomatic.Close contacts are required to stay at their homes, hotel room or any identified accommodation without mixing with the general public or family members for 14 days since the last contact with the confirmed case.Self-quarantined individuals will be followed up by surveillance officers either via phone or via physical visits (in appropriate PPEs) during the period of quarantine. CLICK TO VIEW THE DOCUMENT",
        image: null
      },
      {
        title: "",
        body_formatted: "",
        body_raw: "",
        image: null
      },
      {
        title:
          "Updates Of Coronavirus Disease 2019 (Covid-19) In Ghana - 17 March 2020, 15:00-Hr",
        body_formatted:
          "<br>            <br>            As of 17 March 2020, a total of 143 suspected cases have been tested for COVID-19 by Noguchi Memorial Institute for Medical Research (NMIMR) and Kumasi Centre for Collaborative Research (KCCR). <br>This afternoon (17 March 2020); we have received report from NMIMR that indicated one (1) more <br>confirmed case as positive for COVID-19 in Greater Accra Region. The case patient is a 35-year-old male, <br>a Ghanaian citizen, who returned to Accra from France within the past 14 days. This is another imported <br>case, which brings the total number of confirmed cases to seven (7). The case is being managed in <br>isolation and he is in stable condition. <br>With regard to contact tracing, a total of 350 contacts have been identified and are being followed up. <br>Two of the contacts who developed symptoms, had their samples tested but they came out to be<br>negative. Currently, there is no death and all the seven (7) confirmed COVID-19 cases are being <br>managed in isolation and are in stable condition.<br>",
        body_raw:
          "As of 17 March 2020, a total of 143 suspected cases have been tested for COVID-19 by Noguchi Memorial Institute for Medical Research (NMIMR) and Kumasi Centre for Collaborative Research (KCCR). This afternoon (17 March 2020); we have received report from NMIMR that indicated one (1) more confirmed case as positive for COVID-19 in Greater Accra Region. The case patient is a 35-year-old male, a Ghanaian citizen, who returned to Accra from France within the past 14 days. This is another imported case, which brings the total number of confirmed cases to seven (7). The case is being managed in isolation and he is in stable condition. With regard to contact tracing, a total of 350 contacts have been identified and are being followed up. Two of the contacts who developed symptoms, had their samples tested but they came out to benegative. Currently, there is no death and all the seven (7) confirmed COVID-19 cases are being managed in isolation and are in stable condition.",
        image: null
      },
      {
        title: "Laboratory Resources for testing",
        body_formatted:
          "<br>            <br>            Noguchi Memorial Institute for Medical Research and Kumasi Center for Collaborative Research have been equipped with resources to continue testing of suspected cases.  <br>",
        body_raw:
          "Noguchi Memorial Institute for Medical Research and Kumasi Center for Collaborative Research have been equipped with resources to continue testing of suspected cases.",
        image: null
      },
      {
        title: "Contact Tracing Activation",
        body_formatted:
          "<br>            <br>            A total of six cases have been confirmed so far with no local transmission. 350 contacts have been identified for these cases.Follow up for these contacts have commenced.<br>            The Minister of Health and relevant stakeholders met the Parliamentary Select Committee to deliberate on current progress and what GOG/MOH and other relevant MDAs are doing to ensure the safety of Ghanaians with the current Covid-19 Pandemic.<br>",
        body_raw:
          "A total of six cases have been confirmed so far with no local transmission. 350 contacts have been identified for these cases.Follow up for these contacts have commenced.            The Minister of Health and relevant stakeholders met the Parliamentary Select Committee to deliberate on current progress and what GOG/MOH and other relevant MDAs are doing to ensure the safety of Ghanaians with the current Covid-19 Pandemic.",
        image: null
      },
      {
        title: "",
        body_formatted: "",
        body_raw: "",
        image: null
      },
      {
        title: "Travel Advisory",
        body_formatted:
          "<br>\t\t1. All travel to Ghana is strongly discouraged until further notice.<br>\t\t2. Any traveler, except for Ghanaian citizens and persons with Ghana residence permits, who within the last 14 days, has been to a country that has recorded at least 200 cases of COVID-19,<br>\t\twill not be admitted into the Ghanaian jurisdiction. Airlines are instructed not to allow such persons to embark. Border posts are instructed not to allow such persons into the jurisdiction.<br>\t\t3. There will be a mandatory 14-day self-quarantine for persons who are otherwise allowed to enter the Ghanaian jurisdiction. Guidelines for self-quarantine will be available at the various <br>\t\tGhanaian ports of entry. Enforcement protocols are being deployed in collaboration with state security and health authorities. Persons determined to be unable to satisfactorily self-quarantine will <br>\t\tbe quarantined by the State.<br>\t\t4. Any admissible traveler, who exhibits symptoms of COVID-19 will be quarantined and tested upon reaching Ghana. <br>\t\t5. Item one of this statement takes immediate effect.<br>\t\t6. Items 2,3 & 4 take effect at 1pm on Tuesday March 17th 2020. <br>",
        body_raw:
          "1. All travel to Ghana is strongly discouraged until further notice.\t\t2. Any traveler, except for Ghanaian citizens and persons with Ghana residence permits, who within the last 14 days, has been to a country that has recorded at least 200 cases of COVID-19,\t\twill not be admitted into the Ghanaian jurisdiction. Airlines are instructed not to allow such persons to embark. Border posts are instructed not to allow such persons into the jurisdiction.\t\t3. There will be a mandatory 14-day self-quarantine for persons who are otherwise allowed to enter the Ghanaian jurisdiction. Guidelines for self-quarantine will be available at the various \t\tGhanaian ports of entry. Enforcement protocols are being deployed in collaboration with state security and health authorities. Persons determined to be unable to satisfactorily self-quarantine will \t\tbe quarantined by the State.\t\t4. Any admissible traveler, who exhibits symptoms of COVID-19 will be quarantined and tested upon reaching Ghana. \t\t5. Item one of this statement takes immediate effect.\t\t6. Items 2,3 & 4 take effect at 1pm on Tuesday March 17th 2020.",
        image: null
      },
      {
        title: "Press Briefing - 15th ,March, 2020",
        body_formatted: "<br>            <br>",
        body_raw: "",
        image:
          "https://ghanahealthservice.org/covid19/img/our-imgs/press-15-03-2020.jpg"
      },
      {
        title:
          "Ghana Health Service and Ghana Education Service meet over COVID-19",
        body_formatted:
          "<br>            A joint meeting has been held between top management of Ghana Health Service and Ghana Education Service to discuss measures to put in place in all schools to prevent the  spread COVID-19 in schools.<br>            <br>            Among the issues discussed were: <br>            1.  Finalisation of content on Education materials, <br>            2. orientation and sensitization of staff and students of GES and assesment of schools preparedness. <br>            3. Hotlines for teachers to call  in case any of the signs and symptoms of COVID-19 is  detected in any student or child. <br>            <br>",
        body_raw:
          "A joint meeting has been held between top management of Ghana Health Service and Ghana Education Service to discuss measures to put in place in all schools to prevent the  spread COVID-19 in schools.                        Among the issues discussed were:             1.  Finalisation of content on Education materials,             2. orientation and sensitization of staff and students of GES and assesment of schools preparedness.             3. Hotlines for teachers to call  in case any of the signs and symptoms of COVID-19 is  detected in any student or child.",
        image: "https://ghanahealthservice.org/covid19/img/our-imgs/ghs-ges.jpg"
      },
      {
        title: "Ghana Confirms Two Cases of COVID-19",
        body_formatted:
          "<br>            Both individuals returned to Ghana from Norway and Turkey. These are imported cases of the COVID-19. Both patients are being kept in isolation and are stable. Every Ghanaian should take care of their health and that of their families by adhering to the precautionary measures.<br>            <br>            READ MORE<br>",
        body_raw:
          "Both individuals returned to Ghana from Norway and Turkey. These are imported cases of the COVID-19. Both patients are being kept in isolation and are stable. Every Ghanaian should take care of their health and that of their families by adhering to the precautionary measures.                        READ MORE",
        image: null
      },
      {
        title: "",
        body_formatted: "",
        body_raw: "",
        image: null
      },
      {
        title:
          "WHO statement on cases of COVID-19 surpassing 100 000 - 7th March 2020",
        body_formatted:
          "WHO calls on all countries to continue efforts that have been effective in limiting the number of cases and slowing the spread of the virus.",
        body_raw:
          "WHO calls on all countries to continue efforts that have been effective in limiting the number of cases and slowing the spread of the virus.",
        image: null
      },
      {
        title: "Regular Hand washing",
        body_formatted:
          "The Corona virus finds its way in our bodies when we touch our eyes and nose with infected hands. Hand washing with soap under running water can remove virus and keep us safe from Corona Virus",
        body_raw:
          "The Corona virus finds its way in our bodies when we touch our eyes and nose with infected hands. Hand washing with soap under running water can remove virus and keep us safe from Corona Virus",
        image: null
      },
      {
        title:
          "WHO Director-General's opening remarks at the Mission briefing on COVID-19 - 4 March 2020",
        body_formatted:
          "Our view continues to be that containment of COVID-19 must be the top priority for all countries, but at the same time, countries should be preparing for sustained community transmission.",
        body_raw:
          "Our view continues to be that containment of COVID-19 must be the top priority for all countries, but at the same time, countries should be preparing for sustained community transmission.",
        image: null
      }
    ]
  };
}
