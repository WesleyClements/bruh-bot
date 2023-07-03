import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, client => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.match(/bruh/ig)) return;
  const bruhEmoji = message.guild?.emojis.cache.find(emoji => emoji.name === "bruh");
  if (!bruhEmoji) {
    await message.channel.send("bruh");
    return;
  }
  await message.react(bruhEmoji);
  await message.channel.send(`bruh ${bruhEmoji}`);
});

client.login(process.env.DISCORD_TOKEN);