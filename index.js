import 'dotenv/config';
import {
  Client, Events, GatewayIntentBits, Partials,
} from 'discord.js';

const DILFERD_ID = '259923378343903234';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const getUserRequestFrequency = (() => {
  /** @type {Map<String, {lastMessageTime: number, messageCount: number}>} */
  const userRequestFrequencies = new Map();
  return (userId) => {
    const frequencies = userRequestFrequencies.get(userId) ?? {
      lastMessageTime: 0,
      messageCount: 0,
    };
    userRequestFrequencies.set(userId, frequencies);
    return frequencies;
  };
})();

const isThrottled = (userId, messageTime) => {
  const userRequestFrequency = getUserRequestFrequency(userId);

  if (userRequestFrequency.messageCount === 0) {
    userRequestFrequency.messageCount += 1;
    return false;
  }

  const lockoutTime = 2 ** userRequestFrequency.messageCount * 1_000;
  const timeSinceLastMessage = messageTime - userRequestFrequency.lastMessageTime;

  if (timeSinceLastMessage < lockoutTime) {
    return true;
  }
  const resetTime = Math.max(30, 5 * userRequestFrequency.messageCount);
  if (timeSinceLastMessage > resetTime) {
    userRequestFrequency.messageCount = 0;
  } else {
    userRequestFrequency.messageCount += 1;
  }
  userRequestFrequency.lastMessageTime = messageTime;
  return false;
};

client.once(Events.ClientReady, () => {
  console.log(`Ready! Logged in as ${client.user?.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.match(/br[aue]h/gi)) return;
  if (isThrottled(message.author.id, message.createdTimestamp)) return;
  try {
    const response = await message.channel.send('bruh');
    const bruhEmoji = message.guild?.emojis.cache.find((emoji) => emoji.name === 'bruh');
    if (!bruhEmoji) return;
    await Promise.all([message.react(bruhEmoji), response.react(bruhEmoji)]);
  } catch (err) {
    console.error(err);
  }
});

client.on(Events.MessageReactionAdd, async (reaction) => {
  if (reaction.emoji.name !== 'bruh') return;
  if (reaction.me) return;
  try {
    await reaction.react();
  } catch (err) {
    console.error(err);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.author.id !== DILFERD_ID) return;

  if (!message.content.match(/^\s*[n]/i)) return;
  if (!isThrottled(message.author.id, message.createdTimestamp)) return;

  try {
    await message.delete();
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.DISCORD_TOKEN);
