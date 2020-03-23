import admin from "firebase-admin";
import { database } from "./firebase-connection";

export async function getSubscribersEmailList() {
  try {
    const subscribersEmails = [];
    const subscribersRecords = await database.collection("subscribers").get();
    subscribersRecords.forEach(doc => {
      subscribersEmails.push(doc.data());
    });
   const emailList = subscribersEmails.map(subscriber => subscriber.email);
    return  [...new Set(emailList)] ;
  } catch (error) {
    console.log({ error });
    return [];
  }
}

export async function storeScraperRunResults(data) {
  try {
    const log = { ...data, timestamp: admin.firestore.Timestamp.now() };
    return await database.collection("logs").add(log);
  } catch (error) {
    console.log({ error });
    return null;
  }
}

export async function getlastScraperRunResults() {
  const cases = [];
  const logs = await database
    .collection("logs")
    .orderBy("timestamp", "desc")
    .limit(5)
    .get();
  logs.forEach(doc => {
    cases.push(doc.data());
  });
  return cases[0];
}

export async function storeSubscriber(data) {
  try {
    const log = { ...data, timestamp: admin.firestore.Timestamp.now() };
    return await db.collection("subscribers").add(log);
  } catch (error) {
    console.log({ error });
    return null;
  }
}