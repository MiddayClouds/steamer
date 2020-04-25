// Any module required will be written up here
const Util = require('./../modules/util')
const Logger = new Util.Logger();
const SteamAPI = require('steamapi');

/**
 * Command: NAME
 * Description: DESCRIPTION
 * */

module.exports = {
	name: 'id',
	description: 'fetches a users id ',
	execute(message, args, config) {
    // Creating steam connection
    const steam = new SteamAPI(config.STEAMAPI);
    // Defining what the command.
    const command = args[0].slice(config.PREFIX.length,)
    // Defining the raw argument.
    const rawArgument = args.join(' ')
    // Remove the command from the arguent.
    const argument = rawArgument.replace(config.PREFIX + command + ' ', '')

    // Check in what type of channel the command was executed
		if(message.channel.type === 'dm' || message.channel.type === 'group') {
			Logger.info(`${config.PREFIX + this.name} used in a private ${message.channel.type}.`)
		}
		else{
			Logger.info(`${config.PREFIX + this.name} used on ${message.guild.name} (${message.guild.id}; ${message.guild.memberCount} users)`)
		}

    steam.resolve('https://steamcommunity.com/id/' + argument).then(id =>
    console.log(id)
  )

	},
}
