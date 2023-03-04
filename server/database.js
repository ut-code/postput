import { PrismaClient } from "@prisma/client";
const client = new PrismaClient();

export const getMessageAll = async () => {
  try {
    const messages = await client.message.findMany();
    return {
      type: "messageAll",
      messages: messages.map((m) => ({
        id: m.id,
        name: m.name,
        text: m.text,
        sendTime: m.sendTime,
        updateTime: m.updateTime,
        tags: m.tags ? m.tags.map((t) => t.name) : [],
      })),
    };
  } catch (e) {
    console.error(e.message);
  }
};

export const createMessage = async (message) => {
  try {
    await client.message.create({
      data: {
        name: message.name || "名無し",
        text: message.text || "",
        sendTime: new Date(),
        updateTime: new Date(),
        tags:
          message.tags && message.tags.length > 0
            ? message.tags.map((t) => ({
                create: [
                  {
                    tag: {
                      connectOrCreate: {
                        where: {
                          name: t.name,
                        },
                        create: {
                          name: t.name,
                        },
                      },
                    },
                  },
                ],
              }))
            : undefined,
      },
    });
  } catch (e) {
    console.error(e.message);
  }
};
