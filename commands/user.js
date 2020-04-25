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

    const errorEmbed = {
      "title": "Error.",
      "description": "`Please check your input. Enter aither a url or an id.`",
      "color": 7083600,
      "timestamp": "2020-04-25T13:24:28.354Z",
      "footer": {
        "icon_url": "https://cdn.discordapp.com/icons/700386048626393239/5eb632c8197f919d8ccf55bb46711bc0.webp?size=256",
        "text": "© Midday (Not affiliated with Valve) Powered by the Steam API."
      }
    };

    function getSteamProfileData(id) {
      // Grab user info and cram it under 'summary'
      steam.getUserSummary(id).then(summary => {
        steam.getUserLevel(id).then(level =>{
          const embed = {
              "title": `** ${summary.nickname}**`,
              "description": "This command outputs information for a steam profile.",
              "url": summary.url,
              "color": 15448698,
              "timestamp": new Date(),
              "footer": {
                "icon_url": 'https://cdn.discordapp.com/icons/700386048626393239/5eb632c8197f919d8ccf55bb46711bc0.webp?size=256',
                "text": "© Midday (Not affiliated with Valve) Powered by the Steam API."
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
            return message.channel.send({ embed });
          })
        })
      }


    try {
      if (argument.includes('https://steamcommunity.com/id/')) {
        // THIS IS IF THE ID IS PRETTY AKA NOT A NUMBER
        //console.log('Argument is a pretty id')
        steam.resolve(argument).then(id => {
          //console.log(id)
          const argument = id
          getSteamProfileData(argument)
        })
      } else if (argument.includes('https://steamcommunity.com/profiles/')) {
        // THIS IS IF THE ID IS NOT PRETTY AKA A NUMBER
        //console.log('Argument is a steam 64 id')
        //console.log(argument)
        const argument = argument.slice('https://steamcommunity.com/profiles/',)
        //console.log(argument)
        getSteamProfileData(argument)
      } else if (isNaN(argument) == false) {
        // THIS IS IF SOMEONE ONLY SENDS THE 64 ID
        getSteamProfileData(argument)
      } else if (isNaN(argument) == true){
        // THIS IS IF SOMEONE SENDS THE PRETTY ID
        const argumentPretty = 'https://steamcommunity.com/id/' + argument
        steam.resolve(argumentPretty).then(id => {
          //console.log(id)
          const argumentPretty = id
          getSteamProfileData(argumentPretty)
        })
        //console.log(argumentPretty)
      } else {
        message.channel.send({ errorEmbed });
      }
    } catch (e) {
      //console.log(e)
      message.channel.send({ errorEmbed });
    }

	},
}
