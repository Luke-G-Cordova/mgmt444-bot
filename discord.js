if (process.env.DEV !== 'PROD') require('dotenv').config();

const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
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

const emojiOptions = [
  '👍',
  '👎',
  '❤️',
  '💚',
  '🩵',
  '🧡',
  '💯',
  '🟢',
  '🟣',
  '🟤',
  '🔵',
  '🔴',
  '🟡',
  '🔆',
  '🃏',
];

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
      await member.roles.add(role);

      console.log(
        `${member.user.username} has been assigned the role ${role.name}`
      );
    }
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
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

client.on(Events.MessageCreate, async (message) => {
  const member = await message.guild.members.fetch(message.author.id);
  if (
    message.content.startsWith('!poll') &&
    member.roles.cache.find((e) => e.name === 'team 10' || e.name === 'PM') !=
      null
  ) {
    const descMatch = message.content.match(/(?<=d=").+(?=")/);
    let msg = message.content;
    let description = 'React to vote!';
    if (descMatch != null && descMatch[0] != '') {
      description = descMatch[0];
      msg =
        message.content.substring(0, descMatch.index - 3) +
        message.content.substring(descMatch.index + descMatch[0].length + 2);
    }

    const pollOptions = msg.split(' ').slice(1);

    console.log(
      `Creating poll - Description: "${description}",  Options: ["${pollOptions.join(
        '", "'
      )}"]`
    );

    const pollString = `**Poll**: ${description}\n${pollOptions
      .map((option, index) => `${emojiOptions[index]} : ${option}`)
      .join(pollOptions.length <= 3 ? ', ' : '\n')}`;

    const pollMessage = await message.channel.send(pollString);
    for (let i = 0; i < pollOptions.length; i++) {
      await pollMessage.react(emojiOptions[i]);
    }
    await message.delete();
  }
});

client.login(TOKEN);
