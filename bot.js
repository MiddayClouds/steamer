// Load up the discord.js library. Else throw an error.
try {
	var Discord = require('discord.js')
	if (process.version.slice(1).split('.')[0] < 12) {
		throw new Error('Node 10.0.0 or higher is required. Please upgrade Node.js on your computer / server.')
	}
}
catch (e) {
	console.error(e.stack)
	console.error('Current Node.js version: ' + process.version)
	console.error('In case you´ve not installed any required module: \nPlease run \'npm install\' and ensure it passes with no errors!')
	process.exit()
}

// Disable @everyone.
const client = new Discord.Client({ disableMentions: 'everyone' });
// Grab the prefix, version, development and token from config.
const { PREFIX, VERSION, DEVELOPMENT, TOKEN, NAME, STEAMAPI } = require('./config')
// const BotListUpdater = require('./modules/bot-list-updater').BotListUpdater

// Dependant Modules
const Util = require('./modules/util')
const SteamAPI = require('steamapi');
const Logger = new Util.Logger();
const fs = require('fs');

// Creating a Command Collection
client.commands = new Discord.Collection();
// Grab all files with a .js from the commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
	// Check if command alias exists and use those too if they do exist.
	if(command.alias) {
		for(const alias of command.alias) {
			client.commands.set(alias, command)
		}
	}
}


// Client Events Handlers

// Activate on warning.
client.on('warn', console.warn)

// Activate on error.
client.on('error', console.error)

// Activate when bot loads.
client.on('ready', async () => {
	Logger.info('\nStarting ' + NAME + '...\nNode version: ' + process.version + '\nDiscord.js version: ' + Discord.version + '\n')
	Logger.info('\n' + NAME + ' is online! Running on version: ' + VERSION + '\n')

	// TRUE -> Debugging
	// FALSE -> Production

  // If development is set to true then change the status to idle.
	if (DEVELOPMENT === true) {
    // Setting the status and activity of the bot.
		client.user.setPresence({
			status: 'idle',
			activity: {
				name: `${PREFIX}help | ${client.guilds.cache.size} servers`,
			},
		}).catch(e => {
      // Error handling
			console.error(e)
		})
    // Warn in console that the bot is set to development mode.
		Logger.warn('Bot is currently set in DEVELOPMENT mode. Please refer to config.js!')

	} else {
    // Setting the status and activity of the bot if development is not active
    client.user.setPresence({
      status: 'online',
      activity: {
        name: `${PREFIX}help | ${client.guilds.cache.size} servers`,
      },
    }).catch(e => {
      // Error handling
      console.error(e)
    })
  }

    /*
    THIS IS FOR WHEN THE BOT IS APPROVED ON SITES
		// Creating a new updater
		const updater = new BotListUpdater()

		// Interval for updating the amount of servers the bot is used on on top.gg every 30 minutes
		setInterval(() => {
			updater.updateTopGg(client.guilds.cache.size)
		}, 1800000);

		// Interval for updating the amount of servers the bot is used on on bots.ondiscord.xyz every 10 minutes
		setInterval(() => {
			updater.updateBotsXyz(client.guilds.cache.size)
		}, 600000);

		// Interval for updating the amount of servers the bot is used on on discordbotlist.com every 5 minutes
		setInterval(() => {
			updater.updateDiscordBotList(client.guilds.cache.size, this.totalMembers(), client.voice.connections.size)
		}, 300000);
    */

  // Console info
	Logger.info(`Ready to serve on ${client.guilds.cache.size} servers for a total of ${this.totalMembers()} users.`)
})


// Activates on bot disconnection
client.on('disconnect', () => Logger.info('Disconnected!'))

// Activates on bot reconnection
client.on('reconnecting', () => Logger.info('Reconnecting...'))

// This event will be triggered when the bot joins a guild.
client.on('guildCreate', guild => {

	// Logging the event
	Logger.info(`Joined server ${guild.name} with ${guild.memberCount} users. Total servers: ${client.guilds.cache.size}`)

	// Updating the presence of the bot with the new server amount
	client.user.setPresence({
		activity: {
			name: `${PREFIX}help | ${client.guilds.cache.size} servers`,
		},
	}).catch(e => {
		console.error(e)
	})

  // Create news channel.
  // Create a new channel with permission overwrites
  /*guild.channels.create('new-voice', {
    type: 'text',
    permissionOverwrites: [
      {
        id: message.author.id,
        deny: ['SEND_MESSAGES'],
      },
    ],
  }).then(createdChannel => {
    var id = createdChannel.id
  }) */
  // Figure out how to send one update to all the channels

})

// This event will be triggered when the bot is removed from a guild.
// eslint-disable-next-line no-unused-vars
client.on('guildDelete', guild => {

	// Logging the event
	Logger.info(`Left a server. Total servers: ${client.guilds.cache.size}`)
	// Updating the presence of the bot with the new server amount
	client.user.setPresence({
		activity: {
			name: `${PREFIX}help | ${client.guilds.cache.size} servers`,
		},
	}).catch(e => {
		console.error(e)
	})
})

/**
 * Returns the total amount of users (including bots (sadly...)) who use the bot.
 * */
// TODO: How to just return the "normal" users amount without the bots??
exports.totalMembers = () => {
	const totalMembersArray = client.guilds.cache.map(guild => {
		return guild.memberCount
	})
	let total = 0;
	for(let i = 0; i < totalMembersArray.length; i++) {
		total = total + totalMembersArray[i]
	}
	return total
}

// The data will only be used for analysis.

/* COMMANDS */

client.on('message', async message => {
	if (message.mentions.everyone === false && message.mentions.has(client.user)) {
		// Send the message of the help command as a response to the user
		client.commands.get('help').execute(message, null, { PREFIX, VERSION })
	}

	if (message.author.bot) return
	if (!message.content.startsWith(PREFIX)) return undefined

	const args = message.content.split(' ')

	let command = message.content.toLowerCase().split(' ')[0]
	command = command.slice(PREFIX.length)

	// What should the bot do with an unknown command?
	if (!client.commands.has(command)) return;

	try {
		message.react('703635736603262997');
		client.commands.get(command).execute(message, args, { PREFIX, VERSION, STEAMAPI });
		//message.delete()
		//message.reactions.get('703635736603262997').remove().catch(error => console.error('Failed to remove reactions: ', error));
	}
	catch (error) {
		console.error(error);
		await message.reply('There was an error trying to execute that command!');
	}

})

client.login(TOKEN);

process.on('unhandledRejection', (PromiseRejection) => console.error(`Promise Error -> ${PromiseRejection}`))
