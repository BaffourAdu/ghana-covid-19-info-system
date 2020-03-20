require('dotenv').config();

exports.handler = async (event, context) => {
  const { SCRAPER_AUTH_TOKEN } = process.env;

    return {
      statusCode: 200,
      body: `Hi there, ${SCRAPER_AUTH_TOKEN}`
    };
  };