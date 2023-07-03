import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({ intents: [GatewayIntentBits.MessageContent] });

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content.match(/bruh/ig)) {
    message.channel.send("bruh");
  }
});

client.login(process.env.DISCORD_TOKEN);