var Discord = require("discord.js");
var mybot = new Discord.Client();
var path = require('path');
var events = require('events');
var resp = require('./lib/response.js');
var Cleverbot = require('cleverbot-node');

var fs = require('fs');
var youtubedl = require('youtube-dl');

var mail = process.argv[2];
var pass = process.argv[3];
var eventEmitter = new events.EventEmitter();
var downloading = false;
var playing = false;
var vidarray = [];
var playarray = [];
var cleverbot = new Cleverbot;

var requestagent = require('superagent');
var requestagent2 = require('superagent');
var publicIp = require('public-ip');
var geoip = require('geoip-lite');
var Simsimi = require('simsimi');

var simsimiAPIKey = 'Your_SIMSIMI_API_KEY';
var googleAPIkey = 'Your_GOOGLE_API_KEY';

var simsimi = new Simsimi({
    key: simsimiAPIKey
});

mybot.login(mail, pass);

mybot.on("ready", function () {
    console.log("Ready to begin! Serving in " + mybot.channels.length + " channels");
});

mybot.on("disconnected", function () {
    console.log("Disconnected!");
    process.exit(1);
});

mybot.on("message", function (message) {

    if (message.content.startsWith("!join")) {
        mybot.joinVoiceChannel(message.author.voiceChannel, null);
    }


    if (message.content.startsWith("!play")) {
        if (mybot.voiceConnection != null) {
            var vidLink = message.content.substr(6, message.content.length);
            console.log(vidLink);
            var vidobj = "{\"file\":{\"link\":\"" + vidLink + "\",\"message\":\"" + message + "\"}}"
            vidarray.push(JSON.parse(vidobj));
            eventEmitter.emit('queued');

        } else {
            mybot.reply(message, "I'm not in a voice channel");
        }
    }

    if (message.content.indexOf("please command") === 0) {
        if (message.content.indexOf("pizza") === 15) {
            console.log("Pizza");
            var aliment = "pizza";
            var portee = "3000";
            requete(aliment, portee);
        }

        if (message.content.indexOf("dessert") === 15) {
            var aliment = "dessert";
            var portee = "3000";
            requete(aliment, portee);
        }

        if (message.content.indexOf("sandwich") === 15) {
            var aliment = "sandwich";
            var portee = "3000";
            requete(aliment, portee);
        }
    } else {
        if (message.author.id != mybot.user.id && !message.content.startsWith("!")) {
            simsimi.listen(message.content, function (err, response) {
                mybot.reply(message, response);
            });
        }

    }

    function requete(aliment, portee) {
        publicIp.v4(function (err, ip) {
            //get IP public info
            var ippublic = ip;
            var geo = geoip.lookup(ippublic);
            //console.log(geo);
            //get longitude and latitude
            var long = geo.ll[0];
            var lat = geo.ll[1];
            console.log(long + " " + lat);

            //googlemapAPI request
            //search
            requestagent.get('https://maps.googleapis.com/maps/api/place/radarsearch/json?location=' + long + ',' + lat + '&radius=' + portee + '&keyword=' + aliment + '&key='+googleAPIkey).end(function (err, res) {
                var data = res.text;
                //console.log(data);
                //convert String to JSON
                var json = JSON.parse(data);

                for (var i = 0; i < json.results.length; i++) {
                    requestagent2.get('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + json.results[i].place_id + '&key='+googleAPIkey).end(function (err, datares) {
                        var data2 = datares.text;
                        var json2 = JSON.parse(data2);

                        //retieve phone number
                        var phone = json2.result.international_phone_number;
                        var name = json2.result.name;
                        mybot.reply(message, phone + " : " + name);
                    });

                }

            });

        });
    }


});

eventEmitter.on('queued', function () {
    if (!downloading) {
        var vidobj = vidarray.shift();
        console.log("downloading " + vidobj.file.link);
        var link = vidobj.file.link;
        var message = vidobj.file.message;
        downloading = true;
        youtubedl.getInfo(link, function (err, info) {
            if (err) throw err;
            console.log(info.title);
            youtubedl.exec(link, ['-x', '--audio-format', 'mp3', '--output', '\"%(title)s.%(ext)s\"'], {}, function (err, output) {

                downloading = false;
                var title = info.title.replace(/\//g, '_');
                console.log("Done downloading " + title);
                var playobj = "{\"file\": {\"filename\":\"" + "#" + title + ".mp3\",\"message\":\"" + message + "\"}}"
                playarray.push(JSON.parse(playobj));


                eventEmitter.emit('play');
                if (vidarray.length > 0) {
                    console.log("passed here");
                    eventEmitter.emit('queued');

                }
            });
        });

    }
});

eventEmitter.on('play', function () {
    if (!playing) {
        playing = true;
        if (mybot.internal.voiceConnection) {
            var connection = mybot.internal.voiceConnection;
            var playobj = playarray.shift();
            console.log("playing " + playobj.file.filename);
            var filePath = __dirname + "/" + playobj.file.filename;
            filePath = filePath.replace(/\\/g, "/");
            console.log(filePath);
            connection.playFile(filePath);
        }
    }

});