import * as database from "./database.js";

const clients = [];
class Client {
  userId;
  ws;
  subscribedTags; // 現在閲覧中のタグ
  constructor(userId, ws) {
    this.userId = userId;
    this.ws = ws;
    this.subscribedTags = [];
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
  subscribe(tags) {
    this.subscribedTags = tags;
  }
  isSubscribed(tags) {
    return tags.findIndex((t) => this.subscribedTags.indexOf(t) >= 0) >= 0;
  }
  update(data) {
    if (data.username) {
      this.send({
        type: "user",
        username: data.username,
      });
    }
    if (data.message) {
      if (this.isSubscribed(data.message.tags)) {
        this.send({
          type: "messageAdd",
          message: data.message,
        });
      }
    }
    if (data.messages) {
      this.send({
        type: "messageAll",
        messages: data.messages.filter((m) => this.isSubscribed(m.tags)),
      });
    }
    if (data.recentTags) {
      this.send({
        type: "tagRecentUpdate",
        tags: data.recentTags,
      });
    }
    if (data.favoriteTags) {
      this.send({
        type: "tagFavorite",
        favoriteTags: data.favoriteTags,
      });
    }
  }
}

export default async function wsConnection(userId, ws) {
  const c = new Client(userId, ws);
  clients.push(c);
  ws.on("message", async (msg) => {
    console.log(msg);
    const json = JSON.parse(msg);
    const onError = (e) => {
      c.onError(e);
    };
    if (json.type === "createMessage") {
      const message = await database.createMessage(
        { ...json, userId: userId },
        onError
      );
      for (const ce of clients) {
        ce.update({ message: message });
      }
    } else if (json.type === "subscribe") {
      c.subscribe(json.tags);
      const messages = await database.getMessageAll(onError);
      c.update({ messages: messages });
    } else if (json.type === "fetch") {
      const user = await database.getUserDetailById(userId);
      const messages = await database.getMessageAll(onError);
      const recentTags = await database.getTagRecentUpdate(onError);
      c.update({
        username: user.username,
        favoriteTags: user.favoriteTags,
        messages: messages,
        recentTags: recentTags,
      });
    }
  });
}
