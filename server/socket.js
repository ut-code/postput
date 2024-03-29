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
  isValidTag(tagName) {
    if (!tagName.startsWith(".")) {
      // 通常のタグ
      return true;
    }
    if (tagName === `.keep-${this.userId}`) {
      // このユーザーの保留タグ
      return true;
    }
    if (tagName.startsWith(".reply-")) {
      // 返信タグ
      return true;
    }
    return false;
  }
  subscribe(tags) {
    this.subscribedTags = tags.filter((t) => this.isValidTag(t));
  }
  isSubscribed(tags) {
    return tags.findIndex((t) => this.subscribedTags.indexOf(t) >= 0) >= 0;
  }
  update(data) {
    if (data.username && data.userId === this.userId) {
      this.send({
        type: "user",
        username: data.username,
        userId: data.userId,
      });
    }
    if (data.favoriteTags && data.userId === this.userId) {
      this.send({
        type: "tagFavorite",
        favoriteTags: data.favoriteTags,
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
      this.send({
        type: "keepNum",
        keepNum: data.messages.filter(
          (m) => m.tags.indexOf(`.keep-${this.userId}`) >= 0
        ).length,
      });
    }
    if (data.recentTags) {
      this.send({
        type: "tagRecentUpdate",
        tags: data.recentTags,
      });
    }
  }
}

function updateAllClient(data) {
  console.log("updateAllClient");
  console.log(data);
  for (const c of clients) {
    c.update(data);
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
      const recentTags = await database.getTagRecentUpdate(onError);
      updateAllClient({ message: message, recentTags: recentTags });
    } else if (json.type === "updateMessage") {
      await database.updateMessage(json.mid, json.tags, userId, onError);
      const messages = await database.getMessageAll(onError);
      const recentTags = await database.getTagRecentUpdate(onError);
      updateAllClient({ messages: messages, recentTags: recentTags });
    } else if (json.type === "subscribe") {
      c.subscribe(json.tags);
      const messages = await database.getMessageAll(onError);
      updateAllClient({ messages: messages });
    } else if (json.type === "setFavoriteTags") {
      await database.updateFavoriteTags(userId, json.favoriteTags);
      const user = await database.getUserDetailById(userId);
      updateAllClient({ userId: userId, favoriteTags: user.favoriteTags });
    } else if (json.type === "fetch") {
      const user = await database.getUserDetailById(userId);
      const messages = await database.getMessageAll(onError);
      const recentTags = await database.getTagRecentUpdate(onError);
      c.update({
        userId: userId,
        username: user.username,
        favoriteTags: user.favoriteTags,
        messages: messages,
        recentTags: recentTags,
      });
    }
  });
}
