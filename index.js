const fs = require('fs');
const https = require('https');
const {
    parseString,
    Builder
} = require("xml2js");
const decompress = require("decompress");
const path = require("path");
const timer = ms => new Promise(res => setTimeout(res, ms));

const Discord = require('discord.js');
const config = require('./config.json');
const {
    PassThrough
} = require('stream');
const Client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]
});

const url = "https://donnees.roulez-eco.fr/opendata/instantane";

function import_data() {
    setTimeout(function () {
        console.log("Import data from https://donnees.roulez-eco.fr/opendata/instantane");
        https.get(url, function (res) {
            const fileStream = fs.createWriteStream("file.zip");
            res.pipe(fileStream);
            fileStream.on("finish", function () {
                fileStream.close();
                console.log("Done!");
            })
        })

        setTimeout(function () {
            try {
                const files = decompress("file.zip", "dist", {
                    filter: file => path.extname(file.path) !== ".exe"
                });
                console.log("Done too!")
            } catch (error) {
                console.log(error);
            }
        }, 5000); // permet de lancer la fonction 5 secondes après la récupération de données
        import_data();
    }, 1800000); // permet de relancer la fonction toutes les deux minutes
}

import_data();

Client.on('ready', () => {
    console.log('The BOT is ready');
});

Client.on('messageCreate', message => {
    if (message.content[0] === config.prefix) {
        let splitMessage = message.content.split(" ");
        if (splitMessage[0] === ".carbu") {
            const xml = fs.readFileSync("dist/PrixCarburants_instantane.xml").toString();
            parseString(xml, function (err, data) {
                var cp = splitMessage[1];
                var carb = splitMessage[2];

                var color;

                if(carb == 'Gazole'){
                    color = '#B6873D';
                }
                else if(carb == 'E10'){
                    color = '#919F3E';
                }
                else if(carb == 'SP95'){
                    color = '#81A73D';
                }
                else if(carb == 'SP98'){
                    color = '#5C6E3A';
                }
                else if(carb == 'E85'){
                    color = '#42873D';
                }
                else if(carb == 'GPLc'){
                    color = '#6EB4EC';
                }

                var i = 0;
                var reply = '';
                // Show the XML
                while (data.pdv_liste.pdv[i] != undefined) {
                    if (data.pdv_liste.pdv[i].$.cp == cp) {
                        var j = 0;
                        while (data.pdv_liste.pdv[i].prix[j] != undefined) {
                            if (data.pdv_liste.pdv[i].prix[j].$.nom == carb) {
                                reply += data.pdv_liste.pdv[i].adresse + '\n';
                                reply += data.pdv_liste.pdv[i].prix[j].$.nom + '\n';
                                reply += data.pdv_liste.pdv[i].prix[j].$.valeur + '€' + '\n';
                                reply += '--------------------\n';
                            }
                            j++;
                        }
                    }
                    i++;
                }
                if (reply) {
                    var embed = new Discord.MessageEmbed()
                        .setDescription(reply)
                        .setColor(color);
                    message.channel.send({
                        embeds: [embed]
                    });
                } else {
                    message.channel.send("Aucun résultat.\n.carbuhelp si vous avez besoin d'aide");
                }

            });
        }
    }
});

Client.login(config.token)