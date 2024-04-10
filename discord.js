require('dotenv').config();
const {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
const WELCOME_MESSAGE_ID = process.env.WELCOME_MESSAGE_ID;

const emojiRoleMapping = {
  '1️⃣': 'team 1',
  '2️⃣': 'team 2',
  '3️⃣': 'team 3',
  '4️⃣': 'team 4',
  '5️⃣': 'team 5',
  '6️⃣': 'team 6',
  '7️⃣': 'team 7',
  '8️⃣': 'team 8',
  '9️⃣': 'team 9',
  '🔟': 'team 10',
  '🔀': 'team 11',
  '↩️': 'team 12',
};

client.once(Events.ClientReady, async (client) => {
  console.log('reacting');
  const channel = await client.channels.fetch(WELCOME_CHANNEL_ID);
  const message = await channel.messages.fetch(WELCOME_MESSAGE_ID);
  for (const k of Object.keys(emojiRoleMapping)) {
    message.react(k);
  }
  console.log('bot ready');
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  if (
    reaction.message.channelId !== WELCOME_CHANNEL_ID ||
    reaction.message.id !== WELCOME_MESSAGE_ID
  )
    return;

  const member = await reaction.message.guild.members.fetch(user.id);
  if (!member || member.user.bot) return;
  const emoji = reaction.emoji.name;

  const roleName = emojiRoleMapping[emoji];
  if (roleName) {
    const role = reaction.message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    if (role) {
      // console.log(member.roles);
      await member.roles.add(role);

      console.log(
        `${member.user.username} has been assigned the role ${role.name}`
      );
    }
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (
    reaction.message.channelId !== WELCOME_CHANNEL_ID ||
    reaction.message.id !== WELCOME_MESSAGE_ID
  )
    return;

  const member = await reaction.message.guild.members.fetch(user.id);
  if (!member || member.user.bot) return;

  const emoji = reaction.emoji.name;

  const roleName = emojiRoleMapping[emoji];
  if (roleName) {
    const role = reaction.message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    if (role) {
      await member.roles.remove(role);
      console.log(
        `${member.user.username} has been removed from the role ${role.name}`
      );
    }
  }
});

client.login(TOKEN);
