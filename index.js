const fs = require('fs');
const {parseString, Builder} = require("xml2js");

const Discord = require('discord.js');
const config = require('./config.json')
const Client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]
});

Client.on('ready', () => {
    console.log('The BOT is ready');
});

Client.on('messageCreate', message => {
    if (message.content[0] === config.prefix) {
        let splitMessage = message.content.split(" ");
        if (splitMessage[0] === ".carbu") {
            const xml = fs.readFileSync("PrixCarburants_instantane.xml").toString();
            parseString(xml, function (err, data) {
                var cp = splitMessage[1];
                var carb = splitMessage[2];
                var i = 0;
                var reply = '';
                // Show the XML
                while (data.pdv_liste.pdv[i] != undefined) {
                    if (data.pdv_liste.pdv[i].$.cp == cp) {
                        var j = 0;
                        while (data.pdv_liste.pdv[i].prix[j] != undefined) {
                            if (data.pdv_liste.pdv[i].prix[j].$.nom == carb) {
                                reply += data.pdv_liste.pdv[i].adresse+'\n';
                                reply += data.pdv_liste.pdv[i].prix[j].$.nom+'\n';
                                reply += data.pdv_liste.pdv[i].prix[j].$.valeur+'€'+'\n';
                                reply += '--------------------\n';
                            }
                            j++;
                        }
                    }
                    i++;
                }
                const embed = new Discord.MessageEmbed()
                .setDescription(reply);
                message.channel.send({ embeds: [embed]});
            });
        }
    }
});

Client.login(config.token)