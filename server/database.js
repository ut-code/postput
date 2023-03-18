import { PrismaClient } from "@prisma/client";
const client = new PrismaClient();

export const getUser = async (name) => {
  try {
    return await client.user.findUnique({
      include: {
        favoriteTags: {
          include: {
            tag: true,
          },
        },
      },
      where: {
        username: name,
      },
    });
  } catch (e) {
    console.error(e.message);
    return null;
  }
};
export const getUserById = async (id) => {
  try {
    return await client.user.findUnique({
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
export const getTagAll = async (onError) => {
  try {
    const tags = await client.tag.findMany({});
    return tags.map((m) => ({
      id: m.id,
      name: m.name,
      createTime: m.createTime,
      updateTime: m.updateTime,
    }));
  } catch (e) {
    console.error(e.message);
    onError(e.message);
  }
  return [];
};
export const getTagRecentUpdate = async (onError) => {
  try {
    const tags = await client.tag.findMany({
      orderBy: {
        updateTime: "desc",
      },
    });
    return tags.map((m) => ({
      id: m.id,
      name: m.name,
      createTime: m.createTime,
      updateTime: m.updateTime,
    }));
  } catch (e) {
    console.error(e.message);
    onError(e.message);
  }
  return [];
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
    return messages.map((m) => ({
      id: m.id,
      user: { username: m.user.username },
      text: m.text,
      sendTime: m.sendTime,
      updateTime: m.updateTime,
      tags: m.tags ? m.tags.map((t) => t.tag.name) : [],
    }));
  } catch (e) {
    console.error(e.message);
    onError(e.message);
  }
  return [];
};

export const createMessage = async (message, onError) => {
  try {
    const now = new Date();
    await client.message.create({
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
  } catch (e) {
    console.error(e.message);
    onError(e.message);
  }
};
