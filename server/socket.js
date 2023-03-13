import * as database from "./database.js";

const clients = [];
class Client {
  name;
  ws;
  constructor(name, ws) {
    this.name = name;
    this.ws = ws;
    console.log("client constructor");
  }
  send(data) {
    this.ws.send(JSON.stringify(data));
  }
  onError(message) {
    this.send({
      type: "error",
      message: message,
    });
  }
}

const broadcast = async () => {
  const messages = await database.getMessageAll(() => {});
  const tags = await database.getTagAll(() => {});
  const recentTags = await database.getTagRecentUpdate(() => {});
  for (const c of clients) {
    c.send({
      type: "messageAll",
      messages: messages,
    });
    c.send({
      type: "tagAll",
      tags: tags,
    });
    c.send({
      type: "tagRecentUpdate",
      tags: recentTags,
    });
  }
};

export default function wsConnection(name, ws) {
  const c = new Client(name, ws);
  clients.push(c);
  ws.on("message", async (msg) => {
    console.log(msg);
    const json = JSON.parse(msg);
    if (json.type === "createMessage") {
      await database.createMessage(json, c.onError);
      await broadcast();
    } else if (json.type === "fetch") {
      const messages = await database.getMessageAll(c.onError);
      c.send({ type: "user", name: name });
      c.send({
        type: "messageAll",
        messages: messages,
      });
      const tags = await database.getTagAll(c.onError);
      c.send({
        type: "tagAll",
        tags: tags,
      });
      const recentTags = await database.getTagRecentUpdate(c.onError);
      c.send({
        type: "tagRecentUpdate",
        tags: recentTags,
      });
    }
  });
}
