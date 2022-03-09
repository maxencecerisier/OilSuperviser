const fs = require("fs");
const { parseString, Builder } = require("xml2js");

// Load the XML
const xml = fs.readFileSync("PrixCarburants_instantane.xml").toString();
parseString(xml, function (err, data) {

    var cp = 22300;
    var carb = 'Gazole';
    var i = 0;
    // Show the XML
    while(data.pdv_liste.pdv[i] != undefined){
        if(data.pdv_liste.pdv[i].$.cp == cp){
            console.log(data.pdv_liste.pdv[i].adresse);
            var j = 0;
            while(data.pdv_liste.pdv[i].prix[j] != undefined){
                if(data.pdv_liste.pdv[i].prix[j].$.nom == carb){
                    console.log(data.pdv_liste.pdv[i].prix[j].$.nom);
                    console.log(data.pdv_liste.pdv[i].prix[j].$.valeur,'€');
                    console.log('--------------------');
                }
                j++;
            }
        }
        i++;
    }
});