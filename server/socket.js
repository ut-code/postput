import * as database from "./database.js";

const clients = [];
class Client {
  user;
  ws;
  constructor(user, ws) {
    this.user = user;
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

export default async function wsConnection(userId, ws) {
  const user = await database.getUserById(userId);
  const c = new Client(user, ws);
  clients.push(c);
  ws.on("message", async (msg) => {
    console.log(msg);
    const json = JSON.parse(msg);
    const onError = (e) => {c.onError(e);}
    if (json.type === "createMessage") {
      await database.createMessage(json, onError);
      await broadcast();
    } else if (json.type === "fetch") {
      const messages = await database.getMessageAll(onError);
      c.send({ type: "user", userId: user.id, username: user.username });
      c.send({
        type: "messageAll",
        messages: messages,
      });
      const tags = await database.getTagAll(onError);
      c.send({
        type: "tagAll",
        tags: tags,
      });
      const recentTags = await database.getTagRecentUpdate(onError);
      c.send({
        type: "tagRecentUpdate",
        tags: recentTags,
      });
    }
  });
}
