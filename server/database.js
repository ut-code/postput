import { PrismaClient } from "@prisma/client";
const client = new PrismaClient();

export const getMessageAll = async (onError) => {
  try {
    const messages = await client.message.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          }
        },
      }
    });
    return messages.map((m) => ({
      id: m.id,
      name: m.name,
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
    await client.message.create({
      data: {
        name: message.name || "名無し",
        text: message.text || "",
        sendTime: new Date(),
        updateTime: new Date(),
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
                      },
                    },
                  },
                })),
              }
            : undefined,
      },
    });
  } catch (e) {
    console.error(e.message);
    onError(e.message);
  }
};
