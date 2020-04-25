// Any module required will be written up here
const Util = require('./../modules/util')
const SteamAPI = require('steamapi');
const Logger = new Util.Logger();
/**
 * Command: NAME
 * Description: DESCRIPTION
 * */

module.exports = {
	name: 'user',
	description: 'Fetches user information for a steam id.',
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
    // Grab user info and cram it under 'summary'
    steam.getUserSummary(argument).then(summary => {
      console.log(summary.url);
      steam.getUserLevel(argument).then(level =>{
        const embed = {
          "title": `** ${summary.nickname}**`,
          "description": "This command outputs information for a steam profile.",
          "url": summary.url,
          "color": 15448698,
          "timestamp": new Date(),
          "footer": {
            "icon_url": 'https://cdn.discordapp.com/icons/700386048626393239/5eb632c8197f919d8ccf55bb46711bc0.webp?size=256',
            "text": "Steamer is not affiliated with Valve. Powered by the Steam API. © Midday"
          },
          "thumbnail": {
            "url": summary.avatar.large
          },
          "fields": [
            {
              "name": "Nickname",
              "value": summary.nickname,
              "inline": true
            },
            {
              "name": "Country",
              "value": summary.countryCode,
              "inline": true
            },
            {
              "name": "Level",
              "value": level,
              "inline": true
            }
          ]
        }
        message.channel.send({ embed });
      })
    })

	},
}
