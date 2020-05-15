import admin from "firebase-admin";

require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "ghana-covid-19-ccbdf",
    private_key_id: "-------",
    private_key:
      "-----",
    client_email:
      "firebase-adminsdk-oee4i@ghana-covid-19-ccbdf.iam.gserviceaccount.com",
    client_id: "-------",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-oee4i%40ghana-covid-19-ccbdf.iam.gserviceaccount.com"
  })
});

export const database = admin.firestore();
