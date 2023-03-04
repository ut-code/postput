import { PrismaClient } from "@prisma/client";
const client = new PrismaClient();

export const getMessageTextAll = async () => {
  try{
  const messages = await client.message.findMany();
  return JSON.stringify(messages.map((m) => m.text));
}catch(e){
  console.error(e.message);
}
};

export const createMessage = async (message) => {
  try{
  await client.message.create({
    data: {
      name: message.name || "名無し",
      text: message.text || "",
      sendTime: new Date(),
      updateTime: new Date(),
      tags: (message.tags && message.tags.length > 0) ? message.tags.map((t) => ({
        create: [
          {
            tag: {
              connectOrCreate: {
                where: {
                  id: t.id,
                },
                create: {
                  name: t.name,
                },
              },
            },
          },
        ],
      })) : undefined,
    },
  });
}catch(e){
  console.error(e.message);
}
};
