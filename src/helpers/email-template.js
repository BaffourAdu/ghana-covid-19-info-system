export function parseEmailBody(title, body, image, ghana_stats, global_stats) {
  const ghana_stat = ghana_stats.map(
    stat => `${stat.title}: ${stat.count}<br>`
  );
  const global_stat = global_stats.map(
    stat => `${stat.title}: ${stat.count}<br>`
  );
  return `
          <h3>Ghana's Situation: </h3>
          ${ghana_stat.join("")}
          <hr>
          <h3>Lastest Situation Update: </h3>
          <h3>${title}</h3><p>${body}</p> ${image ? `<img src="${image}">` : ``}
          <hr>
          <h3>Global Situation: </h3>
          ${global_stat.join("")}
          <br><p>source: https://ghanahealthservice.org/covid19/</p>
    `;
}
