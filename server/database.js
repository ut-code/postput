import { PrismaClient } from "@prisma/client";
const client = new PrismaClient();

// login時につかう
export const getUser = async (name) => {
  try {
    const u = await client.user.findUnique({
      where: {
        username: name,
      },
    });
    return u;
  } catch (e) {
    console.error(e.message);
    return null;
  }
};

// WebSocketでつかう
export const getUserDetailById = async (id) => {
  try {
    const u = await client.user.findUnique({
      include: {
        favoriteTags: {
          include: {
            tag: true,
          },
        },
      },
      where: {
        id: id,
      },
    });
    return {
      username: u.username,
      favoriteTags: u.favoriteTags.map((ft) => ft.tag),
    };
  } catch (e) {
    console.error(e.message);
    return null;
  }
};
export const updateFavoriteTags = async (userId, favoriteTags) => {
  try {
    await client.favoriteTag.deleteMany({
      where: {
        userId: userId,
      },
    });
    await Promise.all(
      favoriteTags.map((ft) =>
        (async () => {
          await client.favoriteTag.create({
            data: {
              tag: {
                connect: {
                  name: ft,
                },
              },
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          });
        })()
      )
    );
  } catch (e) {
    console.error(e.message);
    return null;
  }
};
export const addUser = async (name, salt, hashedPassword) => {
  try {
    return await client.user.create({
      data: {
        username: name,
        salt: salt,
        hashedPassword: hashedPassword,
      },
    });
  } catch (e) {
    console.error(e.message);
  }
};

export const getTagRecentUpdate = async (onError) => {
  try {
    const tags = await client.tag.findMany({
      orderBy: {
        updateTime: "desc",
      },
    });
    return tags
      .map((m) => ({
        id: m.id,
        name: m.name,
        createTime: m.createTime,
        updateTime: m.updateTime,
      }))
      .filter((m) => !m.name.startsWith(".")); // .ではじまるタグは非表示
  } catch (e) {
    console.error(e.message);
    onError(e.message);
  }
  return [];
};
export const getReplyNum = async (mid, onError) => {
  try {
    const replies = await client.tag.findUnique({
      where: {
        name: `.reply-${mid}`,
      },
      include: {
        messages: true,
      },
    });
    return replies.messages.length;
  } catch (e) {
    // console.error(e);
    // onError(e.message);
    return 0;
  }
};

export const getMessageAll = async (onError) => {
  try {
    const messages = await client.message.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        user: true,
      },
    });
    return await Promise.all(
      messages.map(async (m) => ({
        id: m.id,
        user: { username: m.user.username },
        text: m.text,
        sendTime: m.sendTime,
        updateTime: m.updateTime,
        tags: m.tags ? m.tags.map((t) => t.tag.name) : [],
        replyNum: await getReplyNum(m.id, onError),
      }))
    );
  } catch (e) {
    console.error(e.message);
    onError(e.message);
  }
  return [];
};

export const createMessage = async (message, onError) => {
  try {
    const now = new Date();
    const m = await client.message.create({
      data: {
        userId: message.userId,
        text: message.text || "",
        sendTime: now,
        updateTime: now,
        tags:
          message.tags && message.tags.length > 0
            ? {
                create: message.tags.map((t) => ({
                  tag: {
                    connectOrCreate: {
                      where: {
                        name: t,
                      },
                      create: {
                        name: t,
                        createTime: now,
                        updateTime: now,
                      },
                    },
                  },
                })),
              }
            : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        user: true,
      },
    });
    await Promise.all(
      message.tags.map((t) =>
        (async () => {
          await client.tag.update({
            where: {
              name: t,
            },
            data: {
              updateTime: now,
            },
          });
        })()
      )
    );
    return {
      id: m.id,
      user: { username: m.user.username },
      text: m.text,
      sendTime: m.sendTime,
      updateTime: m.updateTime,
      tags: m.tags ? m.tags.map((t) => t.tag.name) : [],
    };
  } catch (e) {
    console.error(e.message);
    onError(e.message);
  }
};
export const updateMessage = async (mid, tags, onError) => {
  try {
    const now = new Date();
    const prevTags = (
      await client.message.findUnique({
        where: {
          id: mid,
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
    ).tags.map((t) => t.tag.name);
    // prevTags → tags
    // 追加されたタグを確認
    await Promise.all(
      tags
        .filter((t) => prevTags.indexOf(t) === -1)
        .map(async (t) => {
          await client.tagOnMessage.create({
            data: {
              message: {
                connect: {
                  id: mid,
                },
              },
              tag: {
                connectOrCreate: {
                  where: {
                    name: t,
                  },
                  create: {
                    name: t,
                    createTime: now,
                    updateTime: now,
                  },
                },
              },
            },
          });
        })
    );
    // 削除されたタグを確認
    await Promise.all(
      prevTags
        .filter((t) => tags.indexOf(t) === -1)
        .map(async (t) => {
          await client.tagOnMessage.deleteMany({
            where: {
              messageId: mid,
              tag: {
                name: t,
              },
            },
          });
        })
    );
  } catch (e) {
    console.error(e.message);
    onError(e.message);
  }
};
