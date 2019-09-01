
try{
    var def = require.s.contexts._.defined,
    events = null;

    $.each(def, function(name, obj){
		if (!obj) return;

		if (obj._events && obj._events['chat:receive']){
			events = obj;
			return false;
		}
	});

    if (events){
        if (events._events['chat:receive'].filter(function(a){ return a.callback && a.callback.toString().match(/.&&.\._events&&.\._events\[.\.CHAT\]/); }).length){        
            events.on('chat:receive', function(msg){API.trigger(API.CHAT, _.clone(msg));});
            events._events['chat:receive'].shift();
        }
    }
}catch(e){
    console.log(e);
}


(function() {
	function mediaCheck(adv) {
//    API.on(API.ADVANCE, (adv) => {
		if (!adv.media || !window.getMediaInfo) return;

		getMediaInfo(adv.media)
		.then((data) => {
		  switch(adv.media.format) {
			case 1:
				/*
				este é o objeto recebido quando se trata de youtube
				{
					format: 1,
					raw: content, // a resposta bruta do servidor remoto
					length: 0,
					rejectionReason: null,
					embeddable: null,
					mediaDetails: {
						title: '',
						author: '',
						viewCount: 0,
						likeCount: 0,
						dislikeCount: 0,
						commentCount: 0,
						publishedAt: Date
					 },
				   bestThumbnail: '',
				   youtubeDuration: 0,
				   plugDuration: 0,
				   timeDiff: 0, // ytdur - pdur
				   brRestriction: false
				}

				*/

				if (!data.length) { // number
				  // vídeo indisponível, pule o DJ
				  API.sendChat("/me [mediacheck] @" + adv.dj.username + ", o vídeo que você tocou não está disponível.");

				  //rotina de skip ou lockskip aqui
					if (basicBot.settings.smartSkip) {
					return basicBot.roomUtilities.smartSkip();
					} else {
					return API.moderateForceSkip();
					}
				  return;
				}

				if (data.rejectionReason) { //string
				  //vídeo indisponível, rejectionReason representa o motivo. Normalmente não é mais usado, o length será sempre zero.
				  API.sendChat("/me [mediacheck] @" + adv.dj.username + ", o vídeo que você tocou não está disponível.");

				  // rotina pra pular ou dar lockskip
					if (basicBot.settings.smartSkip) {
					return basicBot.roomUtilities.smartSkip();
					} else {
					return API.moderateForceSkip();
					}
				  return;
				}

				if (!data.embeddable) { // boolean
					// a reprodução do vídeo no youtube e talvez em outro site foi impedida pelo uploader, ele só roda na página do youtube.
					API.sendChat("/me [mediacheck] @" + adv.dj.username + ", o vídeo que você tocou só pode ser reproduzido na página do youtube");

					// rotina pra pular ou dar lockskip
					if (basicBot.settings.smartSkip) {
					return basicBot.roomUtilities.smartSkip();
					} else {
					return API.moderateForceSkip();
					}
					return;
				}

				if (data.brRestriction) { // boolean
					// o vídeo foi proibido de ser reproduzido no brasil.
					API.sendChat("/me [mediacheck] @" + adv.dj.username + ", o vídeo que você tocou não pode ser reproduzido no Brasil.");

					// rotina para pular ou lockskip
					if (basicBot.settings.smartSkip) {
					return basicBot.roomUtilities.smartSkip();
					} else {
					return API.moderateForceSkip();
					}
					return;
				}

				// nota: se data.timeDiff > 0, o vídeo no plug tem duração inferior à duração original no youtube, o vídeo não tocará na íntegra.
				// se data.timeDiff < 0, o vídeo no plug tem duração superior à duração original no youtube, se a diferença foi por ex maior que 3 (segundos)
				// você pode iniciar um timeout pra pular o vídeo.

				if (data.timeDiff > 3) {
					// avise que o vídeo no plug tem duração inferior à original e não será reproduzida na íntegra.
					API.sendChat("/me [mediacheck] @" + adv.dj.username + ", Este video possui duração inferior a original e por isso não será tocado na íntegra.");
					return;
				} else if (data.timeDiff < -3) {
					// avise que a duração do vídeo no plug é superior ao do vídeo original, sendo o DJ pulado ao término dessa real duração.
					API.sendChat("/me [mediacheck] @" + adv.dj.username + ", Este video possui duração superior a original e por isso será pulado ao seu termino real.");

					setTimeout(() => {
						var m = API.getMedia();

					  if (!m || m.cid != adv.media.cid) return;

					  // avise, se quiser, que o vídeo tocou por inteiro. Não é necessário.
					  API.moderateForceSkip();
					}, data.youtubeDuration * 1e3);
				}

				break;

			case 2:
			  /*
			  {
					format: 1,
					raw: content, // a resposta bruta do servidor remoto
					length: 0,
					apiBlocked: false,
					mediaDetails: {
						title: '',
						author: '',
						genre: '',
						favoritingsCount: 0,
						playbackCount: 0,
						downloadCount: 0,
						link: 0,
						artworkURL: 0
					 },
				   soundcloudDuration: 0,
				   plugDuration: 0,
				   timeDiff: 0 // ytdur - pdur
				}
				*/
				if (data.apiBlocked) {
					// o uploader da música impediu a consulta dos dados por meio da API do SoundCloud. Cabe à staff analisar se o som pode tocar e tals.
					// se quiser, mande msg em texto pedindo análise da staff.
					API.sendChat("/me [mediacheck] @staffs, a música atual possui bloqueio de API! uma analise é nescessária.");

					return;
				}

				if (!data.length) { // number
				  // vídeo indisponível, pule o DJ
				  API.sendChat("/me [mediacheck] @" + adv.dj.username + ", o vídeo que você tocou não está disponível.");

				  //rotina de skip ou lockskip aqui
					if (basicBot.settings.smartSkip) {
					return basicBot.roomUtilities.smartSkip();
					} else {
					return API.moderateForceSkip();
					}
				  return;
				}

				if (data.timeDiff > 3) {
					// avise que o áudio no plug tem duração inferior à original e não será reproduzida na íntegra.
					API.sendChat("/me [mediacheck] @" + adv.dj.username + ", Este video possui duração inferior a original e por isso não será tocado na íntegra.");
					return;
				} else if (data.timeDiff < -3) {
					// avise que a duração do áudio no plug é superior ao do áudio original, sendo o DJ pulado ao término dessa real duração.
					API.sendChat("/me [mediacheck] @" + adv.dj.username + ", Este video possui duração superior a original e por isso será pulado ao seu termino real.");

					setTimeout(() => {
						var m = API.getMedia();

					  if (!m || m.cid != adv.media.cid) return;

					  // avise, se quiser, que o áudio tocou por inteiro. Não é necessário.
					  API.moderateForceSkip();
					}, data.soundcloudDuration * 1e3);
				}

			  break;
		  }
		})
		.catch((error) => {
		  console.error(error);
		  API.sendChat('/me [mediacheck] não foi possível consultar detalhes sobre a mídia atual.');
		});
	}
//	});


    //GLOBAL variables quiz
    var quizMaxpoints = 20;
    var quizState = false;
    var quizBand = "";
    var quizYear = "";
    var quizCountry = "";
    var quizCycle = 1;
    var quizLastUID = null;
    var quizLastScore = 0;
    var quizUsers = [];

    var rssFeeds = [
        ["musica", "http://fetchrss.com/rss/5b9926218a93f84a038b4567135578560.xml", 5, 0],
        ["cinema", "https://fetchrss.com/rss/5b9877e38a93f8f26a8b4567184206601.xml", 5, 0],
        ["csgo", "http://fetchrss.com/rss/5b9926218a93f84a038b4567655904660.xml", 5, 0],
        ["progrock", "http://progressiverockcentral.com/en/feed/", 10, 0],
        ["rock", "http://www.rollingstone.com/music.rss", 25, 0],
        ["metal", "http://www.metalstorm.net/rss/news.xml", 15, 0],
        ["jokes", "http://www.jokespalace.com/category/dirty-jokes/feed/", 25, 0],
        ["oneliners", "http://www.jokespalace.com/category/one-liners/feed/", 10, 0],
        ["chicagobears", "http://feeds.feedburner.com/chicagobears/news?format=xml", 15, 0],
        ["football", "http://sports.espn.go.com/espn/rss/nfl/news", 16, 0],
        ["facts", "http://uber-facts.com/feed/", 10, 0],
        ["isles", "https://sports.yahoo.com/nhl/teams/nyi/rss.xml", 34, 0]
    ];


    API.getWaitListPosition = function(id) {
        if (typeof id === 'undefined' || id === null) {
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for (var i = 0; i < wl.length; i++) {
            if (wl[i].id === id) {
                return i;
            }
        }
        return -1;
    };

    var kill = function() {
        basicBot.socket.session.close();
        clearInterval(basicBot.room.autodisableInterval);
        clearInterval(basicBot.room.afkInterval);
        clearInterval(basicBot.room.automsg);
        basicBot.status = false;

		if (window.sweetbot && sweetbot.saveData)
			sweetbot.saveData();
    };

    var storeToStorage = function() {
        localStorage.setItem('basicBotsettings', JSON.stringify(basicBot.settings));
        localStorage.setItem('basicBotRoom', JSON.stringify(basicBot.room));
        var basicBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: basicBot.version
        };
        localStorage.setItem('basicBotStorageInfo', JSON.stringify(basicBotStorageInfo));
    };

    var subChat = function(chat, obj) {
        if (typeof chat === 'undefined') {
            API.chatLog('[Error] Sem resposta do LANG.');
            console.log('[Error] Sem resposta do LANG.');
            return '[Error] Sem resposta do LANG.';

            // TODO: Get missing chat messages from source.
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function(cb) {
        if (!cb) cb = function() {};
        $.get('https://raw.githack.com/brazilex/bot/master/lang.php', function(json) {
            var link = basicBot.chatLink;
            if (json !== null && typeof json !== 'undefined') {
                langIndex = json;
                link = langIndex[basicBot.settings.language.toLowerCase()];
                if (basicBot.settings.chatLink !== basicBot.chatLink) {
                    link = basicBot.settings.chatLink;
                } else {
                    if (typeof link === 'undefined') {
                        link = basicBot.chatLink;
                    }
                }
                $.get(link, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        basicBot.chat = json;
                        cb();
                    }
                });
            } else {
                $.get(basicBot.chatLink, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        basicBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    //emoji map load
    var loadEmoji = function() {
        $.get("https://raw.githubusercontent.com/Warix3/AnimeSrbijaBot/development/Lang/emojimap.json", function(json) {
            if (json !== null && typeof json !== "undefined") {
                if (typeof json === "string") json = JSON.parse(json);
                basicBot.emojimap = json;
                console.log("Emoji map loaded!");
            }
        });
    };

    var retrieveSettings = function() {
        var settings = JSON.parse(localStorage.getItem('basicBotsettings'));
        if (settings !== null) {
            for (var prop in settings) {
                basicBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function() {
        var info = localStorage.getItem('basicBotStorageInfo');
        if (info === null) API.chatLog(basicBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem('basicBotsettings'));
            var room = JSON.parse(localStorage.getItem('basicBotRoom'));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(basicBot.chat.retrievingdata);
                for (var prop in settings) {
                    basicBot.settings[prop] = settings[prop];
                }
                basicBot.room.users = room.users;
                basicBot.room.afkList = room.afkList;
                basicBot.room.historyList = room.historyList;
                basicBot.room.mutedUsers = room.mutedUsers;
                //basicBot.room.autoskip = room.autoskip;
                basicBot.room.roomstats = room.roomstats;
                basicBot.room.messages = room.messages;
                basicBot.room.queue = room.queue;
                basicBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(basicBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var info = _.find(require.s.contexts._.defined, (m) => m && m.attributes && 'hostID' in m.attributes).get('description');
        var ref_bot = '@basicBot=';
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(' ') < link.indexOf('\n')) ind_space = link.indexOf(' ');
            else ind_space = link.indexOf('\n');
            link = link.substring(0, ind_space);
            $.get(link, function(json) {
                if (json !== null && typeof json !== 'undefined') {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        basicBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function(a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            } else arr.push(self[i]);
        }
        return arr;
    };

    String.prototype.startsWith = function(str) {
        return this.substring(0, str.length) === str;
    };

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    function decodeEmoji(s) {

        var wemo = s;
        var first = 0;
        var second = 0;
        var firstFound = false;
        var isIs = false;

        for (var i = 0; i < s.length; i++) {
            if (wemo.charAt(i) == ':' && !firstFound) {
                first = i;
                firstFound = true;
            } else if (wemo.charAt(i) == ':') {
                second = i;
                var possemo = "";
                possemo = (basicBot.emojimap && typeof basicBot.emojimap == 'object' ? basicBot.emojimap[wemo.slice(first + 1, second)] : null);
                if (possemo != null) {
                    var possemo2 = ':' + wemo.slice(first + 1, second) + ':';
                    s = s.replace(possemo2, possemo);
                    firstFound = false;
                    s = decodeEmoji(s);
                } else {
                    firstFound = true;
                    first = second;
                }

            }
        }
        return s;
    };

    function getRandomValue() {
        var value;
        
        for (var x = 0; x < 5; x++)
            value = Math.random();
        
        return value;
    }
    

    /*Echos---------------------------------------------------------------------------------------------------------------------------
    var foreverEcho = (function() {
           return function() {                
               var lastEcho = echoHistory2[echoHistory2.length-1]
               if (!lastEcho.includes("://") && getRank(echoHistory1[echoHistory1.length-1]) > 1 && API.getUsers().length > 1) {
                   API.sendChat(lastEcho);
               }
           };
       })();

       var foreverEchoDelay = (function() {
           return function() {                
               setInterval(foreverEcho, 600000)
           };
       })();

       setTimeout(foreverEchoDelay, 300000) */
    //Slots---------------------------------------------------------------------------------------------------------------------------
    function spinSlots() {
        var slotArray = [':lemon:',
            ':tangerine:',
            ':strawberry:',
            ':pineapple:',
            ':apple:',
            ':grapes:',
            ':watermelon:',
            ':cherries:',
            ':green_heart:',
            ':bell:',
            ':gem:',
            ':green_apple:'
        ];
        var slotValue = [1.5,
            2,
            2.5,
            3,
            3.5,
            4,
            4.5,
            5,
            5.5,
            6,
            6.5,
            7
        ];
        var rand = Math.floor(getRandomValue() * (slotArray.length));
        return [slotArray[rand], slotValue[rand]];
    }

    function spinOutcome(bet) {
        var winnings;
        var outcome1 = spinSlots();
        var outcome2 = spinSlots();
        var outcome3 = spinSlots();

        //Determine Winnings
        if (outcome1[0] == outcome2[0] && outcome1[0] == outcome3[0]) {
            winnings = Math.round(bet * outcome1[1]);
        } else if (outcome1[0] == outcome2[0] && outcome1[0] != outcome3[0]) {
            winnings = Math.round(bet * (.45 * outcome1[1]));
        } else if (outcome1[0] == outcome3[0] && outcome1[0] != outcome2[0]) {
            winnings = Math.round(bet * (.5 * outcome1[1]));
        } else if (outcome2[0] == outcome3[0] && outcome2[0] != outcome1[0]) {
            winnings = Math.round(bet * (.40 * outcome2[1]));
        } else {
            winnings = 0;
        }

        return [outcome1[0], outcome2[0], outcome3[0], winnings];
    }

    //Validate Tokens
    function validateTokens(user) {
        var tokens;

        //Check for existing user tokens
        if (localStorage.getItem(user) == null || localStorage.getItem(user) == "undefined") {
            localStorage.setItem(user, "2");
            tokens = localStorage.getItem(user);
        } else if (localStorage.getItem(user) !== null && localStorage.getItem(user) !== "undefined") {
            tokens = localStorage.getItem(user);
        } else {
            tokens = localStorage.getItem(user);
        }

        return tokens;
    }

    function checkTokens(bet, user) {
        var tokensPreBet = validateTokens(user);
        var tokensPostBet;
        var validBet = true;

        //Adjust amount of tokens
        if (bet > tokensPreBet || bet < 0) {
            validBet = false;
            tokensPostBet = tokensPreBet;
        } else {
            tokensPostBet = tokensPreBet - bet;
        }

        localStorage.setItem(user, tokensPostBet);
        return [tokensPreBet, tokensPostBet, validBet];
    }

    function slotWinnings(winnings, user) {
        var userTokens = parseInt(localStorage.getItem(user)) + winnings;
        if (isNaN(userTokens)) {
            userTokens = winnings;
        }
        localStorage.setItem(user, userTokens);
        return userTokens;
    }

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    var botCreator = 'Yemasthui';
    var botMaintainer = 'DATABASE';
    var botCreatorIDs = [3851534, 4105209, 3926149, 3485598, 5401598, 3575887, 4378851];
	var server_users = [];

	var loadServerUsersList = function() {
        return $.getJSON("https://raw.githack.com/brazilex/bot/master/entrada.php", l => {
            server_users = l;
        })
		.error(() => {
			API.sendChat('/me Não foi possível carregar do servidor a lista de usuários. Dados como VIPs e aniversariantes estarão indisponíveis.');
		});
    };

	function getVipUser(id) {
		var u = server_users.find(i => i.id == id);

		if (!u || !u.vip_expires) return null;

		try {
			var expires = new Date(u.vip_expires + ' 23:59:59 GMT-0300');

			if (Date.now() < expires.getTime())
				return u;
			else
				return null;
		} catch(e) {
			return null;
		}
	}

	function isUserBirthday(id) {
		var u = server_users.find(i => i.id == id);

		if (!u || !u.birthday) return null;

		try {
			var now = new Date();

			var birth_date = new Date(u.birthday + ' GMT-0300');
			var test_date = new Date(u.birthday.replace(/\d{4}/, now.getFullYear()) + ' GMT-0300');
			var birth_ms = test_date.getTime();

			var nowms = now.getTime();

			if (nowms >= birth_ms && nowms < (birth_ms + 86400e3))
				return now.getFullYear() - birth_date.getFullYear();
			else
				return null;
		} catch(e) {
			return null;
		}
	}

    function shortenLink(link, msg){
        var login = "o_2v5mgnoavo";
        var key = "R_3d2542ee22f44ca180245ca5067050e7";
        $.ajax({
            url:"https://api-ssl.bit.ly/v3/shorten",
            data:{longUrl:link, apiKey:key, login:login},
            dataType:"json",
            success:function(v){
                var l = v.data.url;
                API.sendChat(msg.replace("%%LINK%%", l));
            }
        });
    }
    
    var basicBot = {
        version: '1.0 (22/08)',
        status: false,
        name: 'BlexBot',
        loggedInID: null,
        scriptLink: 'https://raw.githack.com/brazilex/bot/master/loader.php',
        cmdLink: '',
        chatLink: 'https://raw.githack.com/brazilex/bot/master/lang.php',
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: 'BlexBot',
            language: 'portuguese',
            chatLink: 'https://raw.githack.com/brazilex/bot/master/lang.php',
            scriptLink: 'https://raw.githack.com/brazilex/bot/master/loader.php',
            roomLock: false, // Requires an extension to re-load the script
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            tema: 'Livre',
            ss: false,
            ed: false,
            cb: false,
            el: false,
            ads: false,
            dic: false,
            sin: false,
            url: false,
            bc: false,
            cot: false,
            automsg: true,
            autoroletaEnabled: true,
            autoroletaInterval: 10,
            autoRoleta: '!roleta',
            roletapos: 2,
            duelTime: 2,
            autowoot: true,
            autoskip: true,
            smartSkip: true,
            cmdDeletion: true,
            maximumAfk: 120,
            afkRemoval: false,
            maximumDc: 60,
            bouncerPlus: true,
            rdjPlus: false,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            historySkip: false,
            timeGuard: true,
            maximumSongLength: 7,
            autodisable: false,
            commandCooldown: 1,
            usercommandsEnabled: true,
            jailsonCommand: true,
            jailsonCooldown: 10,
            skipPosition: 1,
            skipReasons: [
                ['theme', 'This song does not fit the room theme. '],
                ['op', 'This song is on the OP list. '],
                ['history', 'This song is in the history. '],
                ['mix', 'You played a mix, which is against the rules. '],
                ['sound', 'The song you played had bad sound quality or no sound. '],
                ['nsfw', 'The song you contained was NSFW (image or sound). '],
                ['unavailable', 'The song you played was not available for some users. ']
            ],
            afkpositionCheck: 15,
            afkRankCheck: 'ambassador',
            motdEnabled: false,
            motdInterval: 5,
            motd: 'Temporary Message of the Day',
            filterChat: false,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: false,
            commandLiteral: '!',
            blacklists: {
                OP: '',
                NSFW: '',
                PREMIADAS: '',
                BANNED: ''
            },
            mehAutoBan: true,
            mehAutoBanLimit: 5,
            announceActive: false,
            announceMessage: null,
            announceStartTime: null
        },
        socket: {
            url: "wss://mibio.plugbots.tk/socket/websocket",
            session: null,
            interv : 10,
            ti : 0,
            stop : false,
            session : null,
            ka : null,
            lska :0,
            threc: null,
            init: function(){
                this.session = new WebSocket(this.url);
                this.session.onopen = function(){
                    basicBot.socket.session.send(JSON.stringify({
                        'm':'signin',
                        'user': 'SnakeBot',
                        'room': 'snk2018BOT;'
                    }));
                }
                this.session.onclose = function() {
                    clearInterval(basicBot.socket.ka);
                    if ( !basicBot.socket.stop ){
                        basicBot.socket.session.close();
                        basicBot.socket.ti = setTimeout(function(){
                            if ( !basicBot.socket.stop && basicBot.socket.session.readyState == 3 && basicBot.socket.interv >= 0 );
                                basicBot.socket.init(); 
                        }, basicBot.socket.interv*1e3);
                    }
                }
            }
        },
        room: {
            name: null,
            chatMessages: [],
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            //autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function() {
                if (basicBot.status && basicBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },

            automsgInterval: null,
            automsgFunc: function () {
                if (basicBot.status && basicBot.settings.automsg) {
                    API.chatLog('!mensagens');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function() {}, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function() {
                    basicBot.room.roulette.rouletteStatus = true;
                    basicBot.room.roulette.countdown = setTimeout(function() {
                        basicBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(subChat(basicBot.chat.isopen, {
                        pos: basicBot.settings.roletapos
                    }));
                },
                endRoulette: function() {
                    basicBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(getRandomValue() * basicBot.room.roulette.participants.length);
                    var winner = basicBot.room.roulette.participants[ind];
                    basicBot.room.roulette.participants = [];
                    var pos = basicBot.settings.roletapos;
                    var user = basicBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    if (name == null) {
                        API.sendChat(subChat(basicBot.chat.winnernull, {position: pos}));
                    }
                    else {
                        API.sendChat(subChat(basicBot.chat.winnerpicked, {name: name, position: pos}));
                    };
                    var dj = API.getDJ();
                    if (dj && dj.id == user.id) {
                        setTimeout(function () {
                            API.sendChat(subChat(basicBot.chat.djwon, {name: name}));
                        }, 2 * 1000);
                        API.moderateForceSkip();
                    } else {
                        setTimeout(function (winner, pos) {
                            basicBot.userUtilities.moveUser(winner, pos, false);
                        }, 1 * 1000, winner, pos);
                    }
                }
            },
            roulettepp: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    basicBot.room.roulettepp.rouletteStatus = true;
                    basicBot.room.roulettepp.countdown = setTimeout(function () {
                        basicBot.room.roulettepp.endRoulette();
                    }, 60 * 1000);
                    setTimeout(function () {
                        API.sendChat(basicBot.chat.isopenpp);
                    }, 1 * 1000);
                    setTimeout(function () {
                        API.sendChat(basicBot.chat.isopenpp2);
                    }, 2 * 1000);
                },
                endRoulette: function () {
                    basicBot.room.roulettepp.rouletteStatus = false;
                    var user = {};
                    var winner = 0;

                    while (!user.username && basicBot.room.roulettepp.participants.length > 0) {
                        var ind = Math.floor(getRandomValue() * basicBot.room.roulettepp.participants.length);
                        winner = basicBot.room.roulettepp.participants[ind];

                        user = basicBot.userUtilities.lookupUser(winner) || API.getUser(winner);

                        if (!user.username) {
                            basicBot.room.roulettepp.participants.splice(ind, 1);
                        }
                    }
                    basicBot.room.roulettepp.participants = [];

                    var name = user.username;
                    API.sendChat(subChat(basicBot.chat.winnerpickedpp, {name: name}));
                }
            },

            usersUsedJailson: [],
            echoHistory1: [],
            echoHistory2: [],
            SlowMode: false,
            SlowModeDuration: 10,
            APGiveawayOn: false,
            APGiveawayFromTo: [],
            APGiveawayDuration: 0,
            APGiveawayReward: 0,
            APGiveawayTakenNumbers: [],

            duel: {
            users: [],
            stats: false,
            time: null,
            waiting: null,
            randomMensagem: function() {
                var msgs = [
                        'ganhou a luta! Você levou uma surra!',
                        'ganhou a luta! Tente usar outras técnicas na próxima vez.',
                        'ganhou a luta! Parece que você não está tão forte assim.',
                        'ganhou a luta! Nem o seu hacker lhe ajudou!',
                        'ganhou a luta! Vai chorar?',
                        'ganhou a luta! You lose!',
                        'ganhou a luta! Fatality!',
                        'ganhou a luta! Isso deve ter doído tanto pra você quanto aquele 7x1.',
                        'ganhou a luta! Você tem comido bem no almoço? Estás meio fraquinho...',
                        'ganhou a luta! Recomendamos que você consulte este link antes de duelar novamente: http://bit.ly/FikGrande :wink:',
                        'ganhou a luta! Seu whey protein não está funcionando direito',
                        'ganhou a luta! Você quer dizer alguma coisa? Ah é, não pode. :troll:'
                ];
                var count = 0;
                var m = msgs[Math.floor(getRandomValue() * msgs.length)];
                return m;
            },
            start: function() {
                basicBot.room.duel.time = setTimeout(function() {
                    basicBot.room.duel.end();
                }, 30 * 1000);
            },
            end: function() {
                var random = Math.floor(getRandomValue() * basicBot.room.duel.users.length);
                var win = basicBot.userUtilities.lookupUser(basicBot.room.duel.users[random]);
                var loser;
                var msg = basicBot.room.duel.randomMensagem();
                for (var i in basicBot.room.duel.users) {
                    if (win.id != basicBot.room.duel.users[i]) {
                        loser = basicBot.userUtilities.lookupUser(basicBot.room.duel.users[i]);
                    }
                }
                var ind;
                API.sendChat("/me @" + loser.username + ", @" + win.username + " " + msg);
                for (var a = 0; a < basicBot.room.users.length; a++) {
                    if (basicBot.room.users[a].id === loser.id) {
                        ind = a;
                    }
                }
                basicBot.room.users[ind].mute.is = true;
                basicBot.room.users[ind].mute.time = setTimeout(function() {
                    var name = basicBot.room.users[ind].username;
                    var id = basicBot.room.users[ind].id;
                    basicBot.room.users[ind].mute.is = false;
                    API.sendChat("/me @" + name + " pode falar agora nenê.");
                }, basicBot.settings.duelTime * 60 * 1000);
                basicBot.room.duel.stats = false;
                basicBot.room.duel.users = [];
            }
            }
        },
        User: function(id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.mute = {
                time: null,
                is: false
            };
            this.lastKnownPosition = null;
            //anime points
            this.animePoints = 0;
            this.better = null;
            this.offered = 0;
            this.isBetting = false;
            this.toWho = null;
            this.contMehs = 0;
        },
        userUtilities: {
            getJointime: function(user) {
                return user.jointime;
            },
            getUser: function(user) {
                return API.getUser(user.id);
            },
            updatePosition: function(user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function(user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = basicBot.room.roomstats.songCount;
            },
            setLastActivity: function(user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function(user) {
                return user.lastActivity;
            },
            getWarningCount: function(user) {
                return user.afkWarningCount;
            },
            setWarningCount: function(user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function(id) {
                for (var i = 0; i < basicBot.room.users.length; i++) {
                    if (basicBot.room.users[i].id === id) {
                        return basicBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function(name) {
                for (var i = 0; i < basicBot.room.users.length; i++) {
					if (!basicBot.room.users[i].username) {
						//console.log(JSON.stringify(basicBot.room.users[i]));
						continue;
					}

                    var match = basicBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return basicBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function(id) {
                var user = basicBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function(obj) {
                var u;
                if (typeof obj === 'object') u = obj;
                else u = API.getUser(obj);
                if (botCreatorIDs.indexOf(u.id) > -1) return 9999;

                if (!u.gRole) return u.role;
                else {
                    switch (u.gRole) {
                        case 3:
                        case 3000:
                            return (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        case 5:
                        case 5000:
                            return (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                    }
                }
                return 0;
            },
            moveUser: function(id, pos, priority) {
                var user = basicBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function(id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    } else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < basicBot.room.queue.id.length; i++) {
                            if (basicBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            basicBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(basicBot.chat.alreadyadding, {
                                position: basicBot.room.queue.position[alreadyQueued]
                            }));
                        }
                        basicBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            basicBot.room.queue.id.unshift(id);
                            basicBot.room.queue.position.unshift(pos);
                        } else {
                            basicBot.room.queue.id.push(id);
                            basicBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(basicBot.chat.adding, {
                            name: name,
                            position: basicBot.room.queue.position.length
                        }));
                    }
                } else API.moderateMoveDJ(id, pos);
            },
            dclookup: function(id) {
                var user = basicBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return basicBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(basicBot.chat.notdisconnected, {
                    name: name
                });
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return basicBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (basicBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = basicBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(basicBot.chat.toolongago, {
                    name: basicBot.userUtilities.getUser(user).username,
                    time: time
                }));
                var songsPassed = basicBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = basicBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(basicBot.chat.notdisconnected, {
                    name: name
                });
                var msg = subChat(basicBot.chat.valid, {
                    name: basicBot.userUtilities.getUser(user).username,
                    time: time,
                    position: newPosition
                });
                basicBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function(rankString) {
                var rankInt = null;
                switch (rankString) {
                    case 'admin':
                        rankInt = 10;
                        break;
                    case 'ambassador':
                        rankInt = 7;
                        break;
                    case 'host':
                        rankInt = 5;
                        break;
                    case 'cohost':
                        rankInt = 4;
                        break;
                    case 'manager':
                        rankInt = 3;
                        break;
                    case 'bouncer':
                        rankInt = 2;
                        break;
                    case 'residentdj':
                        rankInt = 1;
                        break;
                    case 'user':
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function(msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function() {}, 1000),
                locked: false,
                lockBooth: function() {
                    API.moderateLockWaitList(!basicBot.roomUtilities.booth.locked);
                    basicBot.roomUtilities.booth.locked = false;
                    if (basicBot.settings.lockGuard) {
                        basicBot.roomUtilities.booth.lockTimer = setTimeout(function() {
                            API.moderateLockWaitList(basicBot.roomUtilities.booth.locked);
                        }, basicBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function() {
                    API.moderateLockWaitList(basicBot.roomUtilities.booth.locked);
                    clearTimeout(basicBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function() {
                if (!basicBot.status || !basicBot.settings.afkRemoval) return void(0);
                var rank = basicBot.roomUtilities.rankToNumber(basicBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, basicBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void(0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = basicBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = basicBot.userUtilities.getUser(user);
                            if (rank !== null && basicBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = basicBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = basicBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > basicBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(basicBot.chat.warning1, {
                                            name: name,
                                            time: time
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    } else if (warncount === 1) {
                                        API.sendChat(subChat(basicBot.chat.warning2, {
                                            name: name
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    } else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            basicBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(basicBot.chat.afkremove, {
                                                name: name,
                                                time: time,
                                                position: pos,
                                                maximumafk: basicBot.settings.maximumAfk
                                            }));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function(reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                basicBot.room.queueable = false;

                if (waitlistlength == 50) {
                    basicBot.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function(id) {
                    API.moderateForceSkip();
                    setTimeout(function() {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 500);
                    basicBot.room.skippable = false;
                    setTimeout(function() {
                        basicBot.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function(id) {
                        basicBot.userUtilities.moveUser(id, basicBot.settings.skipPosition, false);
                        basicBot.room.queueable = true;
                        if (locked) {
                            setTimeout(function() {
                                basicBot.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function() {
                $.getJSON('/_/rooms/state', function(data) {
                    if (data.data[0].booth.shouldCycle) { // checks if shouldCycle is true
                        API.moderateDJCycle(false); // Disables the DJ Cycle
                        clearTimeout(basicBot.room.cycleTimer); // Clear the cycleguard timer
                    } else { // If cycle is already disable; enable it
                        if (basicBot.settings.cycleGuard) { // Is cycle guard on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                            basicBot.room.cycleTimer = setTimeout(function() { // Start timer
                                API.moderateDJCycle(false); // Disable cycle
                            }, basicBot.settings.maximumCycletime * 60 * 1000); // The time
                        } else { // So cycleguard is not on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                        }
                    };
                });
            },
            intervalMessage: function() {
                var interval;
                if (basicBot.settings.motdEnabled) interval = basicBot.settings.motdInterval;
                else interval = basicBot.settings.messageInterval;
                if ((basicBot.room.roomstats.songCount % interval) === 0 && basicBot.status) {
                    var msg;
                    if (basicBot.settings.motdEnabled) {
                        msg = basicBot.settings.motd;
                    } else {
                        if (basicBot.settings.intervalMessages.length === 0) return void(0);
                        var messageNumber = basicBot.room.roomstats.songCount % basicBot.settings.intervalMessages.length;
                        msg = basicBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            roletaintervalMessage: function() {
                var interval;
                if (basicBot.settings.autoroletaEnabled) interval = basicBot.settings.autoroletaInterval;
                else interval = basicBot.settings.autoRoleta;
                if ((basicBot.room.roomstats.songCount % interval) === 0 && basicBot.status) {
                    var msg;
                    if (basicBot.settings.autoroletaEnabled) {
                        msg = basicBot.settings.autoRoleta;
                    } else {
                        if (basicBot.settings.autoRoleta.length === 0) return void(0);
                        var messageNumber = basicBot.room.roomstats.songCount % basicBot.settings.autoRoleta.length;
                        msg = basicBot.settings.autoRoleta[messageNumber];
                    }
                    API.chatLog('/me ' + msg);
                }
            },
            updateBlacklists: function() {
                for (var bl in basicBot.settings.blacklists) {
                    basicBot.room.blacklists[bl] = [];
                    if (typeof basicBot.settings.blacklists[bl] === 'function') {
                        basicBot.room.blacklists[bl] = basicBot.settings.blacklists();
                    } else if (typeof basicBot.settings.blacklists[bl] === 'string') {
                        if (basicBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function(l) {
                                $.getJSON(basicBot.settings.blacklists[l], function(data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    basicBot.room.blacklists[l] = list;
                                });
                            })(bl);
                        } catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function() {
                if (typeof console.table !== 'undefined') {
                    console.table(basicBot.room.newBlacklisted);
                } else {
                    console.log(basicBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function() {
                var list = {};
                for (var i = 0; i < basicBot.room.newBlacklisted.length; i++) {
                    var track = basicBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function(chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message);
            chat.message = chat.message.trim();
            chat.message = decodeEmoji(chat.message);
            if (chat.uid != 14044670) {
                $.ajaxSetup({
                    async: true
                });
                /*$.post("http://localhost/log-edit.php",{type:chat.type,un:chat.un,uid:chat.uid,message:chat.message});*/
            }

            basicBot.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]);

            if(chat.type.indexOf('mention') != -1 && chat.message.indexOf('AFK') == -1){
                if(chat.uid != API.getUser().id){
                    var text, quest, resp, msg, match, regex, ind, qc, rc, qh, rh, params, uname;
                    msg = chat.message.toLowerCase();
                    uname = API.getUser().username;
                    if(msg.length == uname.length+1) return;
                    text = (msg.indexOf("span") != -1 ? msg.substr((msg.search("@"+uname)+1+uname.length)) : msg.substr((msg.search("</span>")+9)));
                    text = text.trim();
                    qh = text.substr((text.search(/p:/)+2),(text.search(/r:/)-2)), rh = text.substr((text.search(/r:/)+2));
                    quest = qh.trim(), resp = rh.trim();
                    if(text.indexOf("p:") != -1 && text.indexOf("r:") != -1){
                    	params = {"quest":quest, "resp":resp, "type":'learn',"from":uname,"author":chat.un};
                        if(quest.length == 0 && resp.length == 0) return API.sendChat("@"+chat.un+" eu preciso de todos os campos completos para poder aprender.");
                        if(text.substr(0,2) != "p:") return API.sendChat("@"+chat.un+" desculpe, mas a ordem precisa ser p: e r: respectivamente para que eu consiga aprender.");

                    }else{
                    	params = {"quest":text,"type":"ask","from":uname,"author":chat.un};
                    }
                    $.ajax({
                        url: 'https://app.niceatc.dev/api',
                        type: 'POST',
                        contentType: "application/json",
                        data: JSON.stringify(params),
                        dataType: 'json',
                    }).done(function(d){
                        API.sendChat("@"+chat.un+" "+d.resp);
                    }).fail(function(){
                        API.sendChat('@'+chat.un+" não foi possível contatar o servidor. Tente enviar novamente.");
                    });
                }
            }

            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === chat.uid) {
                    var userSent = basicBot.room.users[i];
                    if (basicBot.room.slowMode) {
                        if ((Date.now() - basicBot.room.users[i].lastActivity) < (basicBot.room.slowModeDuration * 1000)) {
                            API.moderateDeleteChat(chat.cid);
                            return void(0);
                        }
                    }
                    //AnimeSrbija AnimePoints Giveaway
                    if (basicBot.room.APGiveawayOn && isNaN(parseInt(chat.message))) {
                        var num = parseInt(chat.message)

                        if (basicBot.room.APGiveawayTakenNumbers.find(containsNum)) {
                            API.sendChat("/me @" + chat.un + " Esse número está ocupado!");
                        } else if (num >= basicBot.room.APGiveawayFromTo[0] && num <= basicBot.room.APGiveawayFromTo[1]) {
                            userSent.selectedNumber = num;
                            basicBot.room.APGiveawayTakenNumbers.push(num);
                        } else {
                            API.sendChat("/me @" + chat.un + " Esse número está fora dos limites!");
                        }

                        function containsNum(num2) {
                            return num2 == num;
                        }
                    }
                    if (chat.message.indexOf("[AFK]") == -1)
                    basicBot.userUtilities.setLastActivity(basicBot.room.users[i]);
                    if (basicBot.room.users[i].username !== chat.un) {
                        basicBot.room.users[i].username = chat.un;
                    }
                }
            }
            for(var a = 0; a < basicBot.room.users.length; a++){
                if(basicBot.room.users[a].id == chat.uid){
                    if(basicBot.room.users[a].mute.is){
                        API.moderateDeleteChat(chat.cid);
                    }
                }
            }
            if (basicBot.chatUtilities.chatFilter(chat)) return void(0);
            if (!basicBot.chatUtilities.commandCheck(chat))
                basicBot.chatUtilities.action(chat);

            //holy3
            if (quizState && quizBand != "" && quizYear != "" && quizCountry != "" && chat.uid != basicBot.room.currentDJID) {

                var year = new RegExp(quizYear, 'g');
                var country = new RegExp(quizCountry, 'g');

                if (chat.message.match(year) && quizCycle == 1) {
                    API.sendChat("/me @" + chat.un + " Exatamente, +1 ponto! De onde " + quizBand + " vindo?");
                    quizLastScore += 1;
                    quizCycle += 1;
                    quizLastUID = chat.uid;
                } else if (chat.message.match(country) && chat.uid == quizLastUID && quizCycle == 2) {
                    API.sendChat("/me @" + chat.un + " Tacno, +1 bod! Bacite kockice kada ste spremni upisivanjem 3 u chat.");
                    quizLastScore += 1;
                    quizCycle += 1;
                } else if (chat.message == "3" && chat.uid == quizLastUID && quizCycle == 3) {
                    quizCycle += 1;
                    var n1 = Math.floor(getRandomValue() * 6) + 1;
                    var n2 = Math.floor(getRandomValue() * 6) + 1;
                    var msg = "@" + chat.un + "/me Okrenuo si :game_die: " + n1 + " i :game_die: " + n2;
                    switch (n1 + n2) {
                        case 3:
                            quizLastScore += 10;
                            msg += ", I acertar SVETu 3-ica: +12 pontos! Ka-Ching :moneybag:.";
                            break;
                        case 6:
                            quizLastScore *= 2;
                            msg = msg + ", I udvostrucio bodove: +" + quizLastScore + ".";
                            break;
                        case 9:
                            quizLastScore *= 3;
                            msg = msg + ", I utrostrucio vaše bodove: +" + quizLastScore + ".";
                            break;
                        case 12:
                            quizLastScore *= 4;
                            msg = msg + ", I ucetverostrucio vaše bodove: +" + quizLastScore + ".";
                            break;
                        default:
                            msg = msg + ", Nije pogodio ni jedan carobni broj i postigao ukupno " + quizLastScore + " bodova."
                            break;
                    }
                    API.sendChat(msg);
                }
            }
            //END
        },
        eventUserjoin: function(user) {
            // Enviando quantidade de usuários para o servidor
            basicBot.socket.session.send(JSON.stringify({
                "m": "allUsers",
                "total": API.getUsers().length
            }));
            var known = false;
            var index = null;
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                basicBot.room.users[index].inRoom = true;
                var u = basicBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            } else {
                basicBot.room.users.push(new basicBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < basicBot.room.users.length; j++) {
                if (basicBot.userUtilities.getUser(basicBot.room.users[j]).id === user.id) {
                    basicBot.userUtilities.setLastActivity(basicBot.room.users[j]);
                    basicBot.room.users[j].jointime = Date.now();
                }
            }

			var birthday = isUserBirthday(user.id);

			if (birthday) {
				API.sendChat(`/me O aniversariante @${user.username} chegou! 🎉🎈🎁 Nós da Move It lhe desejamos um feliz aniversário!!! Parabéns pelo seus ${birthday} anos! 🎉 `);
			}

			var vipUser = getVipUser(user.id);

			if (vipUser != null && basicBot.settings.welcome && greet && vipUser.welcome) {
                API.sendChat('/me @' + user.username + ' ' + vipUser.welcome);
            } else if (basicBot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function(user) {
                        API.sendChat(subChat(basicBot.chat.welcomeback, {
                            name: user.username,
                            tema: basicBot.settings.tema
                        }));
                    }, 1 * 1000, user) :
                    setTimeout(function(user) {
                        API.sendChat(subChat(basicBot.chat.welcome, {
                            name: user.username,
                            tema: basicBot.settings.tema
                        }));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function(user) {
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === user.id) {
                    basicBot.userUtilities.updateDC(basicBot.room.users[i]);
                    basicBot.room.users[i].inRoom = false;
                    if (lastDJ == user.id) {
                        var user = basicBot.userUtilities.lookupUser(basicBot.room.users[i].id);
                        basicBot.userUtilities.updatePosition(user, 0);
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
            // Enviando quantidade de usuários para o servidor
            basicBot.socket.session.send(JSON.stringify({
                "m": "allUsers",
                "total": API.getUsers().length+1
            }));
        },
        eventVoteupdate: function(obj) {
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        basicBot.room.users[i].votes.woot++;
                    } else {
                        basicBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();
            var timeLeft = API.getTimeRemaining();
            var timeElapsed = API.getTimeElapsed();

            if (basicBot.settings.voteSkip) {
                if ((mehs - woots) >= (basicBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(basicBot.chat.voteskipexceededlimit, {
                        name: dj.username,
                        limit: basicBot.settings.voteSkipLimit
                    }));
                    if (basicBot.settings.smartSkip && timeLeft > timeElapsed) {
                        basicBot.roomUtilities.smartSkip();
                    } else {
                        API.moderateForceSkip();
                    }
                }
            }

            //AnimeSrbija mehAutoBan
            if (basicBot.settings.mehAutoBan) {
                var limit = basicBot.settings.mehAutoBanLimit;
                var voter = obj.user;
                var vote = obj.vote;

                if (vote == -1) {
                    voter.contMehs++;
                } else {
                    voter.contMehs = 0;
                }

                if (voter.contMehs >= limit) {
                    API.moderateBanUser(voter.id, "Você deu meh/chato " + limit + " vezes seguidas, o que não é permitido!", API.BAN.DAY);
                }

            }

        },
        eventCurateupdate: function(obj) {
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === obj.user.id) {
                    basicBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function(obj) {
            if (!obj.dj) return;

			mediaCheck(obj);

            //AnimeSrbija announce command:
            if (basicBot.settings.announceActive && ((Date.now() - basicBot.settings.announceStartTime) >= basicBot.settings.announceTime)) {
                API.sendChat("/me " + basicBot.settings.announceMessage);
                basicBot.settings.announceStartTime = Date.now();
            }

            //AnimeSrbija Anime points
            if (obj.lastPlay != null) {
                var reward = obj.lastPlay.score.positive + (obj.lastPlay.score.grabs * 3) - obj.lastPlay.score.negative;
                var lastdjplayed = basicBot.userUtilities.lookupUser(obj.lastPlay.dj.id);
                lastdjplayed.animePoints += reward;
                API.chatLog("/me [system] @" + lastdjplayed.username + " ganhou " + reward + " MIB Points!");
                $.ajaxSetup({
                    async: true
                });
                $.post("http://kawaibot.tk/ASBleaderboard-edit.php", {
                    winnerid: lastdjplayed.id,
                    winnername: lastdjplayed.username,
                    pointswon: reward,
                    dbPassword: basicBot.settings.dbPassword
                }, function(data) {
                    if (data.trim() != "PWD_OK") {
                        return API.sendChat("/me Problema ao inserir informações em um banco de dados!");
                    };
                });
            }

            if (basicBot.settings.autowoot) {
                $('#woot').click(); // autowoot
            }
            
            var songupdate = {
                m: "updateSong"
            };

            if (obj.media && obj.dj) {
                  songupdate.sn = obj.media.author+' - '+obj.media.title;
                  songupdate.dj = obj.dj.username;
            }

            basicBot.socket.session.send(JSON.stringify(songupdate));

            var user = basicBot.userUtilities.lookupUser(obj.dj.id)
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === user.id) {
                    basicBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }


            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (basicBot.settings.songstats) {
                if (typeof basicBot.chat.songstatistics === 'undefined') {
                    API.sendChat('/me ' + lastplay.media.author + ' - ' + lastplay.media.title + ': ' + lastplay.score.positive + 'W/' + lastplay.score.grabs + 'G/' + lastplay.score.negative + 'M.')
                } else {
                    API.sendChat(subChat(basicBot.chat.songstatistics, {
                        artist: lastplay.media.author,
                        title: lastplay.media.title,
                        woots: lastplay.score.positive,
                        grabs: lastplay.score.grabs,
                        mehs: lastplay.score.negative
                    }))
                }
            }
            basicBot.room.roomstats.totalWoots += lastplay.score.positive;
            basicBot.room.roomstats.totalMehs += lastplay.score.negative;
            basicBot.room.roomstats.totalCurates += lastplay.score.grabs;
            basicBot.room.roomstats.songCount++;
            basicBot.roomUtilities.intervalMessage();
            basicBot.roomUtilities.roletaintervalMessage();
            basicBot.room.currentDJID = obj.dj.id;

            var blacklistSkip = setTimeout(function() {
                var mid = obj.media.format + ':' + obj.media.cid;
                for (var bl in basicBot.room.blacklists) {
                    if (basicBot.settings.blacklistEnabled) {
                        if (basicBot.room.blacklists[bl].indexOf(mid) > -1) {
                            if (bl === "PREMIADAS"){
                                API.sendChat("Essa é uma musica premiada @staff");
                            } else if (bl === "NSFW") {
                                    API.sendChat(subChat(basicBot.chat.isblacklisted, {
                                    blacklist: bl
                                }));
                                if (basicBot.settings.smartSkip) {
                                    return basicBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            }
                        }
                    }
                }
            }, 2000);

            var advMedia = obj.media;

            if (basicBot.settings.timeGuard && advMedia && advMedia.duration > basicBot.settings.maximumSongLength * 60 && !basicBot.room.roomevent) {
                var name = obj.dj.username;
                API.sendChat(subChat(basicBot.chat.timelimit, {
                    name: name,
                    maxlength: basicBot.settings.maximumSongLength
                }));
                setTimeout(function() {
                    var curMedia = API.getMedia();

                    if (!curMedia || advMedia.cid != curMedia.cid || advMedia.format != curMedia.format) return;

                    API.sendChat(subChat(basicBot.chat.skiptime, {
                        name: name,
                        maxlength: basicBot.settings.maximumSongLength
                    }));
                    API.moderateForceSkip();
                }, basicBot.settings.maximumSongLength * 60e3);
            }
            var format = obj.media.format;
            var cid = obj.media.cid;
            clearTimeout(historySkip);
            if (basicBot.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function() {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            basicBot.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                            API.sendChat(subChat(basicBot.chat.songknown, {
                                name: name
                            }));
                            if (basicBot.settings.smartSkip) {
                                return basicBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                    if (!alreadyPlayed) {
                        basicBot.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            if (user.ownSong) {
                API.sendChat(subChat(basicBot.chat.permissionownsong, {
                    name: user.username
                }));
                user.ownSong = false;
            }
            clearTimeout(basicBot.room.autoskipTimer);
            if (basicBot.settings.autoskip) {
                var remaining = obj.media.duration * 1000;
                var startcid = API.getMedia().cid;
                basicBot.room.autoskipTimer = setTimeout(function() {
                    if (!API.getMedia()) return;

                    var endcid = API.getMedia().cid;
                    if (startcid === endcid) {
                        //API.sendChat('Song stuck, skipping...');
                        API.moderateForceSkip();
                    }
                }, remaining + 5000);
            }
            storeToStorage();
            ///holy3 - request info and ask active question
            if (quizState) {

                //Add personal score and check if he/she wins
                if (quizBand != "" && quizLastScore != 0) {
                    if (quizUsers.length > 0) {
                        for (var i = 0; i < quizUsers.length; i++) {
                            if (quizUsers[i][0] == quizLastUID) {
                                quizUsers[i][2] += quizLastScore;
                                if (quizUsers[i][2] >= parseInt(quizMaxpoints, 10)) {
                                    API.sendChat("@" + quizUsers[i][1] + " Você ganhou! Parabéns, você será lembrado por muito tempo. Não é o melhor prêmio que se pode ganhar? ^^");
                                    quizState = false;
                                } else {
                                    API.sendChat("@" + quizUsers[i][1] + " Pontos: " + quizLastScore + " / Pontuação total: " + quizUsers[i][2] + " / Pontos restantes: " + (parseInt(quizMaxpoints, 10) - parseInt(quizUsers[i][2], 10)).toString());
                                }
                                break;
                            } else if (i == quizUsers.length - 1) {
                                quizUsers.push([quizLastUID, basicBot.userUtilities.lookupUser(quizLastUID).username, quizLastScore]);
                                API.sendChat("@" + quizUsers[i][1] + " Pontos: " + quizLastScore + " / Pontuação total: " + quizUsers[i][2] + " / Pontos restantes: " + (parseInt(quizMaxpoints, 10) - parseInt(quizUsers[i][2], 10)).toString());
                            }
                        }
                    } else {
                        quizUsers.push([quizLastUID, basicBot.userUtilities.lookupUser(quizLastUID).username, quizLastScore]);
                        API.sendChat("@" + quizUsers[0][1] + " Pontos: " + quizLastScore + " / Pontuação total: " + quizUsers[0][2] + " / Pontos restantes: " + (parseInt(quizMaxpoints, 10) - parseInt(quizUsers[0][2], 10)).toString());
                    }
                }

                //Reset variables
                quizCycle = 1;
                quizLastScore = 0;

                if (quizState) {

                    //Load current song stats
                    //console.log(newMedia.author + " " + newMedia.duration);
                    var media = API.getMedia();
                    var XMLsource = 'http://musicbrainz.org/ws/2/artist/?query=artist:' + media.author.replace(/ /g, "%20") + '&limit=1';

                    simpleAJAXLib = {

                        init: function() {
                            this.fetchJSON(XMLsource);
                        },

                        fetchJSON: function(url) {
                            var root = 'https://query.yahooapis.com/v1/public/yql?q=';
                            var yql = 'select * from xml where url="' + url + '"';
                            var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
                            document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
                        },

                        jsTag: function(url) {
                            var script = document.createElement('script');
                            script.setAttribute('type', 'text/javascript');
                            script.setAttribute('src', url);
                            return script;
                        },

                        display: function(results) {
                            try {
                                quizCountry = results.query.results.metadata["artist-list"].artist.area.name;
                                quizYear = results.query.results.metadata["artist-list"].artist["life-span"].begin.match(/\d{4}/);
                                quizBand = results.query.results.metadata["artist-list"].artist.name;
                                if (quizCountry != "" && quizYear != "") {
                                    console.log(quizCountry + " " + quizYear);
                                    API.sendChat("Em que ano " + quizBand + " foi fundado?");
                                }
                            } catch (e) {
                                console.log("Error: " + e);
                                API.sendChat("Desculpe, parece que o musicbrainz não reconhece essa banda ou artista. Continuaremos durante a próxima música.");
                                console.log("país ou ano desconhecido");
                            }
                        }
                    }
                    simpleAJAXLib.init();
                }

            }
            // END
        },
        eventWaitlistupdate: function(users) {
            if (users.length < 50) {
                if (basicBot.room.queue.id.length > 0 && basicBot.room.queueable) {
                    basicBot.room.queueable = false;
                    setTimeout(function() {
                        basicBot.room.queueable = true;
                    }, 500);
                    basicBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function() {
                            id = basicBot.room.queue.id.splice(0, 1)[0];
                            pos = basicBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function(id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    basicBot.room.queueing--;
                                    if (basicBot.room.queue.id.length === 0) setTimeout(function() {
                                        basicBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + basicBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = basicBot.userUtilities.lookupUser(users[i].id);
                basicBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function(chat) {
            if (!basicBot.settings.filterChat) return false;
            if (basicBot.userUtilities.getPermission(chat.uid) >= API.ROLE.BOUNCER) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(basicBot.chat.caps, {
                    name: chat.un
                }));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(basicBot.chat.askskip, {
                    name: chat.un
                }));
                return true;
            }
            for (var j = 0; j < basicBot.chatUtilities.spam.length; j++) {
                if (msg === basicBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(basicBot.chat.spam, {
                        name: chat.un
                    }));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function(chat) {
                var msg = chat.message;
                var perm = basicBot.userUtilities.getPermission(chat.uid);
                var user = basicBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < basicBot.room.mutedUsers.length; i++) {
                    if (basicBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (basicBot.settings.lockdownEnabled) {
                    if (perm === API.ROLE.NONE) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (basicBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === API.ROLE.NONE) {
                        API.sendChat(subChat(basicBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(basicBot.chat.adfly, {
                        name: chat.un
                    }));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0 || msg.indexOf('!swap') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (msg.indexOf('@undefined') > -1) {
                       API.moderateDeleteChat(chat.cid);
                }
                if ((msg.indexOf("Use !entrar para participar!") > -1 || msg.indexOf("roleta do batidão") > -1 || msg.indexOf("roleta do batidão") > -1 || msg.indexOf("relatou") > -1 || msg.indexOf("atrás e deve ter posição") > -1 || msg.indexOf("usar o slots") > -1 || msg.indexOf("dlç o bastante") > -1 || msg.indexOf("Entre na lista de espera e tente") > -1 || msg.indexOf("Pontos MIB") > -1 || msg.indexOf("Slots:") > -1 || msg.indexOf("A roleta do batidão foi iniciada") > -1 || msg.indexOf("pró em twerk ganhou posição") > -1 || msg.indexOf("A roleta do Silvão foi iniciada!") > -1 || msg.indexOf("entrou na roleta!  :airplane: Boa Sorte") > -1 || msg.indexOf("MUTE do Duel alterado para:") > -1 || msg.indexOf("te chamou pro fight, caso queira aceitar digite") > -1 || msg.indexOf("demorou para responder, provavelmente está com medo.") > -1 || msg.indexOf("aceitou o duelo! O resultado do confronto sai em instantes") > -1 || msg.indexOf("arregou e não aceitou o duelo!") > -1 || msg.indexOf("ganhou a luta!") > -1 || msg.indexOf("não tem se desconectado") > -1 || msg.indexOf("desconectou-se a muito tempo atrás") > -1 || msg.indexOf("todos os perdedores mutados foram agora desmutados.") > -1) && chat.uid === basicBot.loggedInID) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 2 * 27500, chat.cid);
                    return true;
                }
                if (msg.indexOf('ganhou a posição 4') > -1) {
                 setTimeout(function () {
                  API.sendChat(subChat(basicBot.chat.pos4));
                 }, 2 * 1000);
                 return true;
                }
                if (msg.indexOf('!thor') > -1) {
                 API.sendChat('Não temos thor, temos !fura :lenny:');
                 return true;
                }
                if (msg.indexOf('!loja') > -1) {
                API.sendChat('#1);
                setTimeout(function () {
                  API.moderateDeleteChat(chat.cid);
                 }, 2 * 1000);
                 return true;
                }
                if (msg.indexOf('!pontos') > -1) {
                API.sendChat('#');
                setTimeout(function () {
                  API.moderateDeleteChat(chat.cid);
                 }, 2 * 1000);
                 return true;
                }
                if (msg.indexOf('!vip') > -1) {
                API.sendChat('#');
                setTimeout(function () {
                  API.moderateDeleteChat(chat.cid);
                 }, 2 * 1000);
                 return true;
                }
                if (msg.indexOf('Você esteve inativo por') > 0 || msg.indexOf('removido da fila de espera') > 0) {
                 setTimeout(function () {
                  API.moderateDeleteChat(chat.cid);
                 }, 120 * 1000);
                 return true; 
                }
                if (msg.indexOf('você não é dlç o bastante para provar do suco') > 0 || msg.indexOf('!pontos') > 0  || msg.indexOf('!loja') > 0  || msg.indexOf('!thor') > 0  || msg.indexOf(' [AFK] ') > 0 ) {
                 setTimeout(function () {
                  API.moderateDeleteChat(chat.cid);
                 }, 10 * 1000);
                 return true;
                }
/*                // Filtro anti-mendigo v1, a ser melhorado :eyes: BURKY SAFADO
                if ((msg.indexOf("me da pp") > -1 || msg.indexOf("pP") > -1 || msg.indexOf("Pp") > -1 || msg.indexOf("p P") > -1 || msg.indexOf("P P") > -1 || msg.indexOf("p p") > -1 || msg.indexOf("p l u g p o i n t s") > -1 || msg.indexOf("PLUG POINTS") > -1 || msg.indexOf("PLUGPOINTS") > -1 || msg.indexOf("PP") > -1 || msg.indexOf("manda uns pp") > -1 || msg.indexOf("pontos") > -1 || msg.indexOf("points") > -1 || msg.indexOf("plugpoints") > -1 || msg.indexOf("plug points") > -1 || msg.indexOf("me da pp") > -1 ||  msg.indexOf("pp") > -1) && chat.uid === basicBot.mendigoID) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 10, chat.cid);
                    return true;
                }*/

                var rlJoinChat = basicBot.chat.roulettejoin;
                var rlLeaveChat = basicBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === basicBot.loggedInID) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 5 * 1000, chat.cid);
                    return true;
                }
                var rlJoinChatpp = basicBot.chat.rouletteppentra;
                var rlLeaveChatpp = basicBot.chat.rouletteppsair;

                var joinedroulettepp = rlJoinChatpp.split('%%NAME%%');
                if (joinedroulettepp[1].length > joinedroulettepp[0].length) joinedroulettepp = joinedroulettepp[1];
                else joinedroulettepp = joinedroulettepp[0];

                var leftroulettepp = rlLeaveChatpp.split('%%NAME%%');
                if (leftroulettepp[1].length > leftroulettepp[0].length) leftroulettepp = leftroulettepp[1];
                else leftroulettepp = leftroulettepp[0];

                if ((msg.indexOf(joinedroulettepp) > -1 || msg.indexOf(leftroulettepp) > -1) && chat.uid === basicBot.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 12 * 1000, chat.cid);
                    return true;
                }
                return false;
                },
            commandCheck: function(chat) {
                var cmd;
                if (chat.message.charAt(0) === basicBot.settings.commandLiteral) {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    } else cmd = chat.message.substring(0, space);
                } else return false;
                var userPerm = basicBot.userUtilities.getPermission(chat.uid);
                //console.log('name: ' + chat.un + ', perm: ' + userPerm);
                if (chat.message !== basicBot.settings.commandLiteral + 'join' && chat.message !== basicBot.settings.commandLiteral + 'leave') {
                    if (userPerm === API.ROLE.NONE && !basicBot.room.usercommand) return void(0);
                    if (!basicBot.room.allcommand) return void(0);
                }
                if (chat.message === basicBot.settings.commandLiteral + 'eta' && basicBot.settings.etaRestriction) {
                    if (userPerm < API.ROLE.BOUNCER) {
                        var u = basicBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void(0);
                        } else u.lastEta = Date.now();
                    }
                }

                var executed = false;

                for (var comm in basicBot.commands) {
                    var cmdCall = basicBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (basicBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            basicBot.commands[comm].functionality(chat, basicBot.settings.commandLiteral + cmdCall[i]);

                            if (basicBot.commands[comm].canDelete === false) return true;

                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === API.ROLE.NONE) {
                    basicBot.room.usercommand = false;
                    setTimeout(function() {
                        basicBot.room.usercommand = true;
                    }, basicBot.settings.commandCooldown * 10);
                }
                if (executed) {
                    /*if (basicBot.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }*/

                    //basicBot.room.allcommand = false;
                    //setTimeout(function () {
                    basicBot.room.allcommand = true;
                    //}, 5 * 1000);
                }

                if (basicBot.settings.cmdDeletion && chat.message.startsWith(basicBot.settings.commandLiteral)) {
                    API.moderateDeleteChat(chat.cid);
                }

                return executed;
            },
            action: function(chat) {
                var user = basicBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < basicBot.room.users.length; j++) {
                        if (basicBot.userUtilities.getUser(basicBot.room.users[j]).id === chat.uid) {
                            basicBot.userUtilities.setLastActivity(basicBot.room.users[j]);
                        }

                    }
                }
                basicBot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function() {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function() {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function() {
            var u = API.getUser();
            if (basicBot.userUtilities.getPermission(u) < API.ROLE.BOUNCER) return API.chatLog(basicBot.chat.greyuser);
            if (basicBot.userUtilities.getPermission(u) === API.ROLE.BOUNCER) API.chatLog(basicBot.chat.bouncer);
            basicBot.connectAPI();
            API.moderateDeleteChat = function(cid) {
                $.ajax({
                    url: '/_/chat/' + cid,
                    type: 'DELETE'
                })
            };

            basicBot.room.name = window.location.pathname;
            var Check;

            console.log(basicBot.room.name);

            var detect = function() {
                if (basicBot.room.name != window.location.pathname) {
                    console.log('Killing bot after room change.');
                    storeToStorage();
                    basicBot.disconnectAPI();
                    setTimeout(function() {
                        kill();
                    }, 1000);
                    if (basicBot.settings.roomLock) {
                        window.location = basicBot.room.name;
                    } else {
                        clearInterval(Check);
                    }
                }
            };

            Check = setInterval(function() {
                detect()
            }, 2000);

            retrieveSettings();
            retrieveFromStorage();
			loadServerUsersList();
			loadEmoji();

            window.bot = basicBot;
            basicBot.roomUtilities.updateBlacklists();
            setInterval(basicBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            basicBot.getNewBlacklistedSongs = basicBot.roomUtilities.exportNewBlacklistedSongs;
            basicBot.logNewBlacklistedSongs = basicBot.roomUtilities.logNewBlacklistedSongs;
            if (basicBot.room.roomstats.launchTime === null) {
                basicBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < basicBot.room.users.length; j++) {
                basicBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < basicBot.room.users.length; j++) {
                    if (basicBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    basicBot.room.users[ind].inRoom = true;
                } else {
                    basicBot.room.users.push(new basicBot.User(userlist[i].id, userlist[i].username));
                    ind = basicBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(basicBot.room.users[ind].id) + 1;
                basicBot.userUtilities.updatePosition(basicBot.room.users[ind], wlIndex);
            }
            basicBot.room.afkInterval = setInterval(function() {
                //basicBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            basicBot.room.autodisableInterval = setInterval(function() {
                basicBot.room.autodisableFunc();
            }, 60 * 60 * 1000);
            basicBot.room.automsg = setInterval(function () {
             basicBot.room.automsgFunc();
            }, 8 * 60 * 1000);
            basicBot.loggedInID = API.getUser().id;
            basicBot.status = true;
            API.sendChat('/cap ' + basicBot.settings.startupCap);
            API.setVolume(basicBot.settings.startupVolume);
            if (basicBot.settings.autowoot) {
                $('#woot').click();
            }
            if (basicBot.settings.startupEmoji) {
                var emojibuttonoff = $('.icon-emoji-off');
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            } else {
                var emojibuttonon = $('.icon-emoji-on');
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Limite de avatares alterado para ' + basicBot.settings.startupCap);
            API.chatLog('Volume alterado para ' + basicBot.settings.startupVolume);
            API.chatLog('Olá ' + API.getUser().username + ', seja bem vindo!');
            //socket();
            loadChat(API.sendChat(subChat(basicBot.chat.online, {
                botname: basicBot.settings.botName,
                version: basicBot.version
            })));

            /* Inicia o socket */
            basicBot.socket.init();
        },
        commands: {
            executable: function(minRank, chat) {
                var id = chat.uid;
                var perm = basicBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'ambassador':
                        minPerm = (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'host':
                        minPerm = API.ROLE.HOST;
                        break;
                    case 'cohost':
                        minPerm = API.ROLE.COHOST;
                        break;
                    case 'manager':
                        minPerm = API.ROLE.MANAGER;
                        break;
                    case 'mod':
                        if (basicBot.settings.bouncerPlus) {
                            minPerm = API.ROLE.BOUNCER;
                        } else {
                            minPerm = API.ROLE.MANAGER;
                        }
                        break;
                    case 'bouncer':
                        minPerm = API.ROLE.BOUNCER;
                        break;
                    case 'rdjPlus':
                        if (basicBot.settings.rdjPlus) {
                            minPerm = API.ROLE.DJ;
                        } else {
                            minPerm = API.ROLE.BOUNCER;
                        }
                        break;
                    case 'residentdj':
                        minPerm = API.ROLE.DJ;
                        break;
                    case 'user':
                        minPerm = API.ROLE.NONE;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },

            /*
            command: {
                command: 'cmd',
                rank: 'user/bouncer/mod/manager',
                type: 'startsWith/exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {

                    }
                }
            },
            */

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;

                        var launchT = basicBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = durationOnline / 1000;

                        if (msg.length === cmd.length) time = since;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(basicBot.chat.invalidtime, {
                                name: chat.un
                            }));
                        }
                        for (var i = 0; i < basicBot.room.users.length; i++) {
                            userTime = basicBot.userUtilities.getLastActivity(basicBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(basicBot.chat.activeusersintime, {
                            name: chat.un,
                            amount: chatters,
                            time: time
                        }));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (basicBot.room.roomevent) {
                                    basicBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },



            chatoCommand: {
                command: 'chato',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            var name = chat.message.substring(cmd.length + 2);
                            var msg = chat.message;
                            API.sendChat('/me @' + name + ', evite dar muitos "chatos", nós costumamos apenas silenciar as músicas. Caso dê muitos chatos você poderá ser banido.'); 
                     }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.autodisable) {
                            basicBot.settings.autodisable = !basicBot.settings.autodisable;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.autodisable
                            }));
                        } else {
                            basicBot.settings.autodisable = !basicBot.settings.autodisable;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.autodisable
                            }));
                        }

                    }
                }
            },

            ssCommand: {
                command: 'ss',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.ss = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.ssTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.ss = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.ssTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.ss) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'ss',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[SimSimi \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            cotCommand: {
                command: 'cot',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.cot = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.cotTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.cot = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.cotTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.ss) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'cot',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[Cotação \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            bcCommand: {
                command: 'bc',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.bc = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.bcTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.bc = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.bcTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.ss) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'bc',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[BitCoin \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            edCommand: {
                command: 'ed',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.ed = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.edTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.ed = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.edTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.ed) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'ed',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[Robô ED \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            cbCommand: {
                command: 'cb',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.cb = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.cbTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.cb = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.cbTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.cb) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'cb',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[Clever Bot \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            elCommand: {
                command: 'el',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.el = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.elTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.ed = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.elTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.el) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'el',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[Elektra \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            adsCommand: {
                command: 'ads',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.ads = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.adsTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.ads = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.adsTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.ads) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'ads',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);                            
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[ADS Bot \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },


            dicCommand: {
                command: 'dic',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.dic = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.dicTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.dic = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.dicTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.dic) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'dic',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[Dicionário \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            sinCommand: {
                command: 'sin',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.sin = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.sinTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.sin = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.sinTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.sin) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'sin',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[Sinônimo \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            urlCommand: {
                command: 'url',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.url = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.urlTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.url = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.urlTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.url) return;

                    $.ajax({
                            url: 'https://chatters.plugbots.tk',
                            method: 'POST',
                            data: {
                                bot: 'url',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);
                            var name = chat.un;
                            var msg = resp.replace(/<\/?[^>]+(>|$)/g, "");

                            API.sendChat('[Sinônimo \u003e @'+ name +'] '+ msg);
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            shortenCommand: {
                command: ['short'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd){
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat("@"+chat.un+" link não específicado");
                        var link = msg.substring(cmd.length + 1);
                        var prots = ['http','https','www'];
                        for(var i in prots){
                            if(link.indexOf(prots[i]) != -1){
                                return shortenLink(link, "@"+chat.un+" link encurtado: %%LINK%%");
                            }
                        }
                        API.sendChat("@"+chat.un+" link inválido, tente enviar novamente.");
                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.autoskip) {
                            basicBot.settings.autoskip = !basicBot.settings.autoskip;
                            clearTimeout(basicBot.room.autoskipTimer);
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.autoskip
                            }));
                        } else {
                            basicBot.settings.autoskip = !basicBot.settings.autoskip;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.autoskip
                            }));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(basicBot.chat.autowoot);
                    }
                }
            },

            cleardbCommand: {
                command: 'cleardb',
                rank: 'cohost',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        localStorage.clear();
                        localStorage.removeItem("basicBotsettings");
                        localStorage.removeItem("basicBotRoom");
                        localStorage.removeItem("basicBotStorageInfo");
                        basicBot.disconnectAPI();
                        API.sendChat("/me @" + chat.un + " Dados locais apagados e redefinidos");
                        setTimeout(function() {
                            $.getScript(basicBot.scriptLink);
                        }, 2000);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                        var randomUser = Math.floor(getRandomValue() * crowd.length);
                        var randomBall = Math.floor(getRandomValue() * basicBot.chat.balls.length);
                        var randomSentence = Math.floor(getRandomValue() * 1);
                        API.sendChat(subChat(basicBot.chat.ball, {
                            name: chat.un,
                            botname: basicBot.settings.botName,
                            question: argument,
                            response: basicBot.chat.balls[randomBall]
                        }));
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permFrom = basicBot.userUtilities.getPermission(chat.uid);
                        var permUser = basicBot.userUtilities.getPermission(user.id);
                        if (permUser >= permFrom) return void(0);
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                        setTimeout(function () {
                               API.sendChat('https://i.imgur.com/O3DHIA5.gif');
                        }, 1 * 1000);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nolistspecified, {
                            name: chat.un
                        }));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof basicBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(basicBot.chat.invalidlistspecified, {
                            name: chat.un
                        }));
                        else {
                            var media = API.getMedia();
                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            basicBot.room.newBlacklisted.push(track);
                            basicBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(basicBot.chat.newblacklisted, {
                                name: chat.un,
                                blacklist: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            }));
                            if (basicBot.settings.smartSkip && timeLeft > timeElapsed) {
                                basicBot.roomUtilities.smartSkip();
                            } else {
                                API.moderateForceSkip();
                            }
                            if (typeof basicBot.room.newBlacklistedSongFunction === 'function') {
                                basicBot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ':' + cid;

                        API.sendChat(subChat(basicBot.chat.blinfo, {
                            name: name,
                            author: author,
                            title: title,
                            songid: songid
                        }));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (basicBot.settings.bouncerPlus) {
                            basicBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': 'Bouncer+'
                            }));
                        } else {
                            if (!basicBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = basicBot.userUtilities.getPermission(id);
                                if (perm > API.ROLE.BOUNCER) {
                                    basicBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(basicBot.chat.toggleon, {
                                        name: chat.un,
                                        'function': 'Bouncer+'
                                    }));
                                }
                            } else return API.sendChat(subChat(basicBot.chat.bouncerplusrank, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            rdjPlusCommand: {
                command: 'rdjplus',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (basicBot.settings.rdjPlus) {
                            basicBot.settings.rdjPlus = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': 'RDJ+'
                            }));
                        } else {
                            if (!basicBot.settings.rdjPlus) {
                                var id = chat.uid;
                                var perm = basicBot.userUtilities.getPermission(id);
                                if (perm > API.ROLE.BOUNCER) {
                                    basicBot.settings.rdjPlus = true;
                                    return API.sendChat(subChat(basicBot.chat.toggleon, {
                                        name: chat.un,
                                        'function': 'RDJ+'
                                    }));
                                }
                            } else return API.sendChat(subChat(basicBot.chat.rdjplusrank, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            downloadCommand: {
                command: ['download', 'dl'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    var uri = API.getMedia().cid;
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length && API.getMedia().format == 1)
                        return API.sendChat('Download da musica atual em MP3: https://dl.plugbots.tk/yt/mp3/' + uri);
					else if (API.getMedia().format == 2) {
                         API.sendChat('Não é possivel fazer download do SoundCloud :/');
					}


                    if (basicBot.commands.executable('user', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'mp3') {
                            API.sendChat('Download da musica atual em MP3: https://dl.plugbots.tk/yt/mp3/' + uri);
                        }
                        if (mode == 'aac') {
                            return API.sendChat('Download da musica atual em AAC: https://dl.plugbots.tk/yt/aac/' + uri);
                        }
                        if (mode == 'vorbis') {
                            return API.sendChat('Download da musica atual em VORBIS: https://dl.plugbots.tk/yt/vorbis/' + uri);
                        }
                        if (mode == 'opus') {
                            return API.sendChat('Download da musica atual em OPUS: https://dl.plugbots.tk/yt/opus/' + uri);
                        }
                        if (mode == 'vorbis-ogg') {
                            return API.sendChat('Download da musica atual em VORBIS-OGG: https://dl.plugbots.tk/yt/vorbis-ogg/' + uri);
                        }
                        if (mode == 'opus-ogg') {
                            return API.sendChat('Download da musica atual em OPUS-OGG: https://dl.plugbots.tk/yt/opus-ogg/' + uri);
                        }
                    }
                }
            },

            refreshMIBUsersCommand: {
                command: ['loadusers'],
                rank: 'cohost',
                type: 'startsWith',
                functionality: function(chat, cmd) {
					loadServerUsersList()
					.success(() => {
						API.sendChat('/me [loadusers] usuários: ' + server_users.length);
					});
                }
            },

			saveMIBPoints: {
                command: ['savepoints', 'savedata'],
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
					if (!window.sweetbot || !window.sweetbot.saveData || !window.sweetbot.userData)
						return API.sendChat('/me [Blex Points] contexto não existente.');

					sweetbot.saveData();

					$.ajax({
						type:'POST',
						url:'https://code.niceatc.dev/@/botdata.php',
						contentType:'application/json',
						data:JSON.stringify(sweetbot.userData)
					})
					.done(() => {
						API.sendChat('/me [Blex Points] dados salvos com sucesso.');
					})
					.fail((jqXHR, textStatus, errorThrown) => {
						//console.log(a.responseText || a.statusText);
						console.log(jqXHR, textStatus, errorThrown);
	
						try {
							console.log(JSON.stringify(jqXHR));
						} catch(e){
							var k = Object.keys(jqXHR);

							for (var i in k) {
								console.log(k[i], jqXHR[k[i]]);
							}
						}

						API.sendChat('/me [Blex Points] falha ao salvar os dados.');
					});
                }
            },

			loadMIBPoints: {
                command: ['loadpoints', 'loaddata'],
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
					if (!window.sweetbot || !window.sweetbot.saveData || !window.sweetbot.userData)
						return API.sendChat('/me [Blex Points] contexto não existente.');

					$.getJSON('https://code.niceatc.dev/@/botdata.php', d => {
						sweetbot.userData = d;
						sweetbot.saveData();
						API.sendChat('/me [Blex Points] dados carregados com sucesso.');
					})
					.fail((jqXHR, textStatus, errorThrown) => {
						//console.log(a.responseText || a.statusText);
						console.log(jqXHR, textStatus, errorThrown);
	
						try {
							console.log(JSON.stringify(jqXHR));
						} catch(e){
							var k = Object.keys(jqXHR);

							for (var i in k) {
								console.log(k[i], jqXHR[k[i]]);
							}
						}

						API.sendChat('/me [Blex Points] falha ao salvar os dados.');
					});
                }
            },

            // FUNÃ‡ÃƒO DE DUEL (POR ENQUANTO SOMENTE UM DUEL POR VEZ)
            fightCommand: {
                command: ['x1', 'duel', 'fight'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (!basicBot.room.duel.stats) {
                            var msg = chat.message;
                            var space = msg.indexOf(' ');
                            if (space === -1) {
                                API.sendChat("/me @" + chat.un + " é !duel @user... :expressionless: ");
                                return false;
                            } else {
                                var name = msg.substring(space + 2);

                                var user = basicBot.userUtilities.lookupUserName(name);
                                var from = chat.uid;
                                var to = user.id;
                                var ismuted;
                                if (user.mute.is) {
                                    ismuted = true;
                                }
                                if (!ismuted) {
                                    if (user === false || !user.inRoom) {
                                        return API.sendChat("/me @" + chat.un + " seu inimigo não foi encontrado na sala, talvez ele tenha arregado. :confused:");
                                    } else if (user.username === chat.un) {
                                        return API.sendChat("/me @" + chat.un + " não entendo o motivo de você querer lutar contra sí mesmo(a), você é uma pessoa tão lindo(a). :confused:");
                                    } else {
                                        API.sendChat("/me @" + user.username + ", @" + chat.un + " te chamou pro fight, caso queira aceitar digite !aceito, do contrário digite !rejeito. O perdedor será mutado por " + basicBot.settings.duelTime + " minutos.");
                                        basicBot.room.duel.stats = true;
                                        basicBot.room.duel.users.push(from, to);
                                        basicBot.room.duel.waiting = setTimeout(function() {
                                            API.sendChat("/me @" + chat.un + ", @" + user.username + " demorou para responder, provavelmente está com medo. Tente novamente depois.");
                                            basicBot.room.duel.stats = false;
                                            basicBot.room.duel.users = [];
                                        }, 30 * 1000);
                                    }
                                } else {
                                    API.sendChat("/me @" + chat.un + " parece que há perdedores recentes neste seu duelo, espere este ser desmutado para duelar novamente.");
                                }
                            }
                        } else API.sendChat("/me @" + chat.un + " já está havendo um duelo, espere este acabar!");
                    }
                }
            },

            aceitoCommand: {
                command: 'aceito',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.room.duel.users[0] != chat.uid) {
                            for (var i in basicBot.room.duel.users) {
                                if (chat.uid == basicBot.room.duel.users[i]) {
                                    clearTimeout(basicBot.room.duel.waiting);
                                    var from = basicBot.room.duel.users[i - 1];
                                    var user = basicBot.userUtilities.lookupUser(from);
                                    API.sendChat("/me @" + user.username + ", @" + chat.un + " aceitou o duelo! O resultado do confronto sai em instantes.");
                                    basicBot.room.duel.start();
                                }
                            }
                        }
                    }
                }
            },

            rejeitoCommand: {
                command: 'rejeito',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.room.duel.users[0] != chat.uid) {
                            for (var i in basicBot.room.duel.users) {
                                if (chat.uid == basicBot.room.duel.users[i]) {
                                    clearTimeout(basicBot.room.duel.waiting);
                                    var from = basicBot.room.duel.users[i - 1];
                                    var user = basicBot.userUtilities.lookupUser(from);
                                    API.sendChat("/me @" + user.username + ", @" + chat.un + " arregou e não aceitou o duelo!");
                                    basicBot.room.duel.users = [];
                                    basicBot.room.duel.stats = false;
                                }
                            }
                        }
                    }
                }
            },

            clearduelCommand: {
                command: 'clearduel',
                rank: 'cohost',
                type: 'startsWith',
                functionality: function(chat, cmd){
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat("/me @"+chat.un+" todos os perdedores mutados foram agora desmutados.");
                        for(var i in basicBot.room.users){
                            clearTimeout(basicBot.room.users[i].mute.time);
                            basicBot.room.users[i].mute.time = null;
                            basicBot.room.users[i].mute.is = false;
                        }
                    }
                }
            },

            setduelCommand: {
                command: ['setduel'],
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            basicBot.settings.duelTime = maxTime;
                            return API.sendChat(subChat(basicBot.chat.duelTime, {
                                name: chat.un,
                                time: basicBot.settings.duelTime
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(basicBot.chat.currentbotname, {
                            botname: basicBot.settings.botName
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            basicBot.settings.botName = argument;
                            API.sendChat(subChat(basicBot.chat.botnameset, {
                                botName: basicBot.settings.botName
                            }));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute('data-cid'));
                        }
                        return API.sendChat(subChat(basicBot.chat.chatcleared, {
                            name: chat.un
                        }));
                    }
                }
            },

            commandsCommand: {
                command: ['commands', 'comandos', 'cmds'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(basicBot.chat.commandslink, {
                            botname: basicBot.settings.botName,
                            link: basicBot.cmdLink
                        }));
                    }
                }
            },

            cookieCommand: {
                command: ['cookie','bolacha','biscoito'],
                rank: 'user',
                type: 'startsWith',
                getCookie: function(chat) {
                    var c = Math.floor(getRandomValue() * basicBot.chat.cookies.length);
                    return basicBot.chat.cookies[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(basicBot.chat.eatcookie);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.nousercookie, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.selfcookie, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(basicBot.chat.cookie, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    cookie: this.getCookie()
                                }));
                            }
                        }
                    }
                }
            },

            mitoCommand: {
                command: 'mito',
                rank: 'user',
                type: 'startsWith',
                getMito: function(chat) {
                    var c = Math.floor(getRandomValue() * basicBot.chat.mito.length);
                    return basicBot.chat.mito[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var dj = API.getDJ();
                        var name = dj.username;

                        API.sendChat(subChat(basicBot.chat.mitoChat, {
                                    nameto: dj.username,
                                    namefrom: chat.un,
                                    mito: this.getMito()
                                }));
                    }
                }
            },

            hinoCommand: {
                command: 'hino',
                rank: 'user',
                type: 'startsWith',
                getHino: function(chat) {
                    var c = Math.floor(getRandomValue() * basicBot.chat.hino.length);
                    return basicBot.chat.hino[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var dj = API.getDJ();
                        var name = dj.username;

                        API.sendChat(subChat(basicBot.chat.hinoChat, {
                                    nameto: dj.username,
                                    namefrom: chat.un,
                                    hino: this.getHino()
                                }));
                    }
                }
            },

            lixoCommand: {
                command: 'lixo',
                rank: 'user',
                type: 'startsWith',
                getLixo: function(chat) {
                    var c = Math.floor(getRandomValue() * basicBot.chat.lixo.length);
                    return basicBot.chat.lixo[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var dj = API.getDJ();
                        var name = dj.username;

                        API.sendChat(subChat(basicBot.chat.lixoChat, {
                                    nameto: dj.username,
                                    namefrom: chat.un,
                                    lixo: this.getLixo()
                                }));
                    }
                }
            },

            perguntaCommand: {
                command: 'pergunta',
                rank: 'user',
                type: 'startsWith',
                getPerguntas: function(chat) {
                    var c = Math.floor(getRandomValue() * basicBot.chat.perguntas.length);
                    return basicBot.chat.perguntas[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(basicBot.chat.botPerguntar);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.nouserPerguntar, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.selfPerguntar, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(basicBot.chat.perguntar, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    perguntar: this.getPerguntas()
                                }));
                            }
                        }
                    }
                }
            },

            seduzirCommand: {
                command: 'cantada',
                rank: 'user',
                type: 'startsWith',
                getSeduzir: function(chat) {
                    var c = Math.floor(getRandomValue() * basicBot.chat.seduzir.length);
                    return basicBot.chat.seduzir[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;


                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(basicBot.chat.botSeduzir);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.nouserSeduzir, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.selfSeduzir, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(basicBot.chat.seduzirs, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    seduzir: this.getSeduzir()
                                }));
                            }
                        }
                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = basicBot.userUtilities.getPermission(chat.uid);
                            if (perm < API.ROLE.BOUNCER) return API.sendChat(subChat(basicBot.chat.dclookuprank, {
                                name: chat.un
                            }));
                        }
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var toChat = basicBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                command: [],
                rank: 'host',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.split('@')[1].trim();
                        var name2 = msg.split('@')[2].trim();
                        var user1 = basicBot.userUtilities.lookupUserName(name1);
                        var user2 = basicBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(basicBot.chat.swapinvalid, {
                            name: chat.un
                        }));
                        if (user1.id === basicBot.loggedInID || user2.id === basicBot.loggedInID) return API.sendChat(subChat(basicBot.chat.addbottowaitlist, {
                            name: chat.un
                        }));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 && p2 < 0) return API.sendChat(subChat(basicBot.chat.swapwlonly, {
                            name: chat.un
                        }));
                        API.sendChat(subChat(basicBot.chat.swapping, {
                            'name1': name1,
                            'name2': name2
                        }));
                        if (p1 === -1) {
                            API.moderateRemoveDJ(user2.id);
                            setTimeout(function(user1, p2) {
                                basicBot.userUtilities.moveUser(user1.id, p2, true);
                            }, 2000, user1, p2);
                        } else if (p2 === -1) {
                            API.moderateRemoveDJ(user1.id);
                            setTimeout(function(user2, p1) {
                                basicBot.userUtilities.moveUser(user2.id, p1, true);
                            }, 2000, user2, p1);
                        } else if (p1 < p2) {
                            basicBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function(user1, p2) {
                                basicBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        } else {
                            basicBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function(user2, p1) {
                                basicBot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        for (var i = 1; i < basicBot.room.chatMessages.length; i++) {
                            if (basicBot.room.chatMessages[i].indexOf(user.id) > -1) {
                                API.moderateDeleteChat(basicBot.room.chatMessages[i][0]);
                                basicBot.room.chatMessages[i].splice(0);
                            }
                        }
                        API.sendChat(subChat(basicBot.chat.deletechat, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            emojiCommand: {
                command: ['emoji','emote'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(basicBot.chat.emojilist, {
                            link: link
                        }));
                    }
                }
            },

            fotoCommand: {
                command: 'foto',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat('/me Veja nesse link como ter sua foto no chat do Plug: ');
                    }
                }
            },

            infoCommand: {
                command: 'info',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        getMediaInfo(API.getMedia())
                        .then(d => {
                            var m = '/me Tocando no momento: ';
    
                            if (d.format == 1) {
                                var time = d.youtubeDuration;
                                var timeString = basicBot.roomUtilities.msToStr(time*1e3);
                                m += d.mediaDetails.author + ' - ' + d.mediaDetails.title +
                                    ' (:tv: : ' + d.mediaDetails.viewCount + ', :+1:: ' + d.mediaDetails.likeCount + ', :-1:: ' + d.mediaDetails.dislikeCount +
                                    ', :speech_balloon:: ' + d.mediaDetails.commentCount +
                                    ', duração: ' + (d.live ? 'ao vivo' : timeString) + '), enviado em: ' + d.mediaDetails.publishedAt
                            } else if (d.format == 2) {
                                var timesc = d.soundcloudDuration;
                                var timeStringsc = basicBot.roomUtilities.msToStr(timesc*1e3);
                                m += d.mediaDetails.author + ' - ' + d.mediaDetails.title +
                                    ' (:tv: : ' + d.mediaDetails.playbackCount + ', :star:: ' + d.mediaDetails.favoritingsCount + ', gênero: ' + d.mediaDetails.genre +
                                    ', downloads: ' + d.mediaDetails.downloadCount +
                                    ', duração: ' + timeStringsc + ')';
                            } else {
                                m += 'sei lá';
                            }

                            API.sendChat(m);
                        })
                        .catch(e => API.sendChat('Algo de errado aconteceu: ' + e.message));
                    }
                }
            },

            botsonCommand: {
                command: 'botson',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.settings.ss = true;
                        basicBot.settings.ed = true;
                        basicBot.settings.ads = true;
                        basicBot.settings.el = true;
                        basicBot.settings.cb = true;
                        basicBot.settings.sin = true;
                        basicBot.settings.dic = true;
                        basicBot.settings.cot = true;
                        basicBot.settings.bc = true;
                        basicBot.settings.url = true;
                        API.sendChat("/me Todos os ChattersBots ativados!");
                    }
                }
            },

            botsoffCommand: {
                command: 'botsoff',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.settings.ss = false;
                        basicBot.settings.ed = false;
                        basicBot.settings.ads = false;
                        basicBot.settings.el = false;
                        basicBot.settings.cb = false;
                        basicBot.settings.sin = false;
                        basicBot.settings.dic = false;
                        basicBot.settings.cot = false;
                        basicBot.settings.bc = false;
                        basicBot.settings.url = false;
                        API.sendChat("/me Todos os ChattersBots desativados!");
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = basicBot.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch (lang) {
                            case 'en':
                                break;
                            case 'da':
                                ch += 'Vær venlig at tale engelsk.';
                                break;
                            case 'de':
                                ch += 'Bitte sprechen Sie Englisch.';
                                break;
                            case 'es':
                                ch += 'Por favor, hable Inglés.';
                                break;
                            case 'fr':
                                ch += 'Parlez anglais, s\'il vous plaît.';
                                break;
                            case 'nl':
                                ch += 'Spreek Engels, alstublieft.';
                                break;
                            case 'pl':
                                ch += 'Prosze mówic po angielsku.';
                                break;
                            case 'pt':
                                ch += 'Por favor, fale Inglês.';
                                break;
                            case 'sk':
                                ch += 'Hovorte po anglicky, prosím.';
                                break;
                            case 'cs':
                                ch += 'Mluvte prosím anglicky.';
                                break;
                            case 'sr':
                                ch += '????? ???, ???????? ????????.';
                                break;
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var perm = basicBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < API.ROLE.BOUNCER) return void(0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(basicBot.chat.youaredj, {
                            name: name
                        }));
                        if (pos < 0) return API.sendChat(subChat(basicBot.chat.notinwaitlist, {
                            name: name
                        }));
                        if (pos == 0) return API.sendChat(subChat(basicBot.chat.youarenext, {
                            name: name
                        }));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = basicBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(basicBot.chat.eta, {
                            name: name,
                            time: estimateString,
                            position: realpos
                        }));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.filterChat) {
                            basicBot.settings.filterChat = !basicBot.settings.filterChat;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.chatfilter
                            }));
                        } else {
                            basicBot.settings.filterChat = !basicBot.settings.filterChat;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.chatfilter
                            }));
                        }
                    }
                }
            },

            forceskipCommand: {
                command: ['forceskip', 'fs'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(basicBot.chat.forceskip, {
                            name: chat.un
                        }));
                        API.moderateForceSkip();
                        basicBot.room.skippable = false;
                        setTimeout(function() {
                            basicBot.room.skippable = true
                        }, 5 * 1000);
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.historySkip) {
                            basicBot.settings.historySkip = !basicBot.settings.historySkip;
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.historyskip
                            }));
                        } else {
                            basicBot.settings.historySkip = !basicBot.settings.historySkip;
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.historyskip
                            }));
                        }
                    }
                }
            },

            joinCommand: {
                command: ['join','doces'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                         var id = chat.uid;
                         var name = chat.un;
                         var isDj;
                            if (typeof API.getDJ() != "undefined") {
                                isDj = API.getDJ().id == id ? true : false;
                            } else {
                                isDj = false;
                            }
                            var djlist = API.getWaitList();
                            if (isDj === true)
                                API.sendChat("@" + name + " você só pode entrar na roleta quando não for o DJ.");
                            if (isDj === false)
                        if (basicBot.room.roulette.rouletteStatus && basicBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            basicBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(basicBot.chat.roulettejoin, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            entrarppCommand: {
                command: 'pp',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (basicBot.room.roulettepp.rouletteStatus && basicBot.room.roulettepp.participants.indexOf(chat.uid) < 0) {
                            basicBot.room.roulettepp.participants.push(chat.uid);
                            API.sendChat(subChat(basicBot.chat.rouletteppentra, {name: chat.un}));
                        }
                    }
                }
            },

            sairppCommand: {
                command: 'sair',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = basicBot.room.roulettepp.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            basicBot.room.roulettepp.participants.splice(ind, 1);
                            API.sendChat(subChat(basicBot.chat.rouletteppsair, {name: chat.un}));
                        }
                    }
                }
            },

            rouletteppCommand: {
                command: 'roletapp',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!basicBot.room.roulettepp.rouletteStatus) {
                            basicBot.room.roulettepp.startRoulette();
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var join = basicBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = basicBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(basicBot.chat.jointime, {
                            namefrom: chat.un,
                            username: name,
                            time: timeString
                        }));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = basicBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));

                        var permFrom = basicBot.userUtilities.getPermission(chat.uid);
                        var permTokick = basicBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(basicBot.chat.kickrank, {
                                name: chat.un
                            }));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(basicBot.chat.kick, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function(id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        } else API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'cohost',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        storeToStorage();
                        //sendToSocket();
                        API.sendChat(basicBot.chat.kill);
                        basicBot.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(basicBot.chat.currentlang, {
                            language: basicBot.settings.language
                        }));
                        var argument = msg.substring(cmd.length + 1);

                        $.get('https://rawgit.com/basicBot/source/master/lang/langIndex.json', function(json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === 'undefined') {
                                API.sendChat(subChat(basicBot.chat.langerror, {
                                    link: 'http://git.io/vJ9nI'
                                }));
                            } else {
                                basicBot.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(basicBot.chat.langset, {
                                    language: basicBot.settings.language
                                }));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var ind = basicBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            basicBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(basicBot.chat.rouletteleave, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = basicBot.userUtilities.lookupUser(chat.uid);
                        var perm = basicBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= API.ROLE.DJ || isDj) {
                            if (media.format === 1) {
                                var linkToSong = 'https://youtu.be/' + media.cid;
                                API.sendChat(subChat(basicBot.chat.songlink, {
                                    name: from,
                                    link: linkToSong
                                }));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function(sound) {
                                    API.sendChat(subChat(basicBot.chat.songlink, {
                                        name: from,
                                        link: sound.permalink_url
                                    }));
                                });
                            }
                        }
                    }
                }
            },

            automsgCommand: {
              command: 'automsg',
              rank: 'bouncer',
              type: 'exact',
              functionality: function (chat, cmd) {
               if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
               if (!basicBot.commands.executable(this.rank, chat)) return void (0);
               else {
                if (basicBot.settings.automsg) {
                 basicBot.settings.automsg = !basicBot.settings.automsg;
                 return API.sendChat(subChat(basicBot.chat.toggleoff, {name: chat.un, 'function': basicBot.chat.automsg}));
                }
                else {
                 basicBot.settings.automsg = !basicBot.settings.automsg;
                 return API.sendChat(subChat(basicBot.chat.toggleon, {name: chat.un, 'function': basicBot.chat.automsg}));
                }

               }
              }
             },

            logoutCommand: {
                command: 'logou',
                rank: 'host',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(basicBot.chat.logout, {
                            name: chat.un,
                            botname: basicBot.settings.botName
                        }));
                        setTimeout(function() {
                            $('.logout').mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: ['maxlength','tempo'],
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            basicBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(basicBot.chat.maxlengthtime, {
                                name: chat.un,
                                time: basicBot.settings.maximumSongLength
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + basicBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!basicBot.settings.motdEnabled) basicBot.settings.motdEnabled = !basicBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            basicBot.settings.motd = argument;
                            API.sendChat(subChat(basicBot.chat.motdset, {
                                msg: basicBot.settings.motd
                            }));
                        } else {
                            basicBot.settings.motdInterval = argument;
                            API.sendChat(subChat(basicBot.chat.motdintervalset, {
                                interval: basicBot.settings.motdInterval
                            }));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        if (user.id === basicBot.loggedInID) return API.sendChat(subChat(basicBot.chat.addbotwaitlist, {
                            name: chat.un
                        }));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(basicBot.chat.move, {
                                name: chat.un
                            }));
                            basicBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(basicBot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof basicBot.settings.opLink === 'string')
                            return API.sendChat(subChat(basicBot.chat.oplist, {
                                link: basicBot.settings.opLink
                            }));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(basicBot.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refres',
                rank: 'host',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        //sendToSocket();
                        storeToStorage();
                        basicBot.disconnectAPI();
                        setTimeout(function() {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reloa',
                rank: 'host',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(basicBot.chat.reload);
                        //sendToSocket();
                        storeToStorage();
                        basicBot.disconnectAPI();
                        kill();
                        setTimeout(function() {
                            $.getScript(basicBot.settings.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                } else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(basicBot.chat.removenotinwl, {
                                name: chat.un,
                                username: name
                            }));
                        } else API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            rouletteCommand: {
                command: 'roleta',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (!basicBot.room.roulette.rouletteStatus) {
                            basicBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            stoproletaCommand: {
                command: ['killroleta', 'pararoleta', 'stoproleta'],
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.room.roulette.stopRoulette();
                        clearTimeout(basicBot.room.roulette.countdown);
                        API.sendChat(subChat(basicBot.chat.killtroll, {
                            name: chat.un
                        }));
                    }
                }
            },

            frouletteCommand: {
                command: ['forceroleta'],
                rank: 'cohost',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.room.roulette.endRoulette();
                        clearTimeout(basicBot.room.roulette.countdown);

                    }
                }
            },

            sayCommand: {
                command: ['say'],
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                        API.sendChat(subChat(basicBot.chat.say, {
                            question: argument,
                        }));
                    }
                }
            },

            setroletaCommand: {
                command: ['setroleta'],
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxPos = msg.substring(cmd.length + 1);
                        if (!isNaN(maxPos)) {
                            basicBot.settings.roletapos = maxPos;
                            return API.sendChat(subChat(basicBot.chat.setRoleta, {
                                name: chat.un,
                                pos: basicBot.settings.roletapos
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            rulesCommand: {
                command: ['rules', 'regras'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof basicBot.settings.rulesLink === 'string')
                            return API.sendChat(subChat(basicBot.chat.roomrules, {
                                link: basicBot.settings.rulesLink
                            }));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var woots = basicBot.room.roomstats.totalWoots;
                        var mehs = basicBot.room.roomstats.totalMehs;
                        var grabs = basicBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(basicBot.chat.sessionstats, {
                            name: from,
                            woots: woots,
                            mehs: mehs,
                            grabs: grabs
                        }));
                    }
                }
            },

            skipRDJCommand: {
                command: 'skipplus',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (botRDJIDs.indexOf(user.id) > -1) {
                            API.moderateForceSkip();
                        }
                    }
                }
            },

            skipCommand: {
                command: ['skip', 'smartskip'],
                rank: 'rdjPlus',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.room.skippable) {

                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var dj = API.getDJ();
                            var name = dj.username;
                            var msgSend = '@' + name + ', ';

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(basicBot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (basicBot.settings.smartSkip && timeLeft > timeElapsed) {
                                    basicBot.roomUtilities.smartSkip();
                                } else {
                                    API.moderateForceSkip();
                                }
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < basicBot.settings.skipReasons.length; i++) {
                                var r = basicBot.settings.skipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += basicBot.settings.skipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(basicBot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (basicBot.settings.smartSkip && timeLeft > timeElapsed) {
                                    basicBot.roomUtilities.smartSkip(msgSend);
                                } else {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.sendChat(msgSend);
                                    }, 500);
                                }
                            }
                        }
                    }
                }
            },

            skipposCommand: {
                command: 'skippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            basicBot.settings.skipPosition = pos;
                            return API.sendChat(subChat(basicBot.chat.skippos, {
                                name: chat.un,
                                position: basicBot.settings.skipPosition
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.songstats) {
                            basicBot.settings.songstats = !basicBot.settings.songstats;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.songstats
                            }));
                        } else {
                            basicBot.settings.songstats = !basicBot.settings.songstats;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.songstats
                            }));
                        }
                    }
                }
            },

            terrorCommand: {
                command: 'terror',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                       var c, mensagens;
                       mensagens = [ "Que ótimo dia para um exorcismo!",
                                     "Que os jogos comecem",
                                     "Um, dois, o Freddy vem te pegar. Três, quatro, é melhor trancar a porta. Cinco, seis, agarre seu crucifixo. Sete, oito, fique acordado até tarde. Nove, dez, não durma nunca mais",
                                     "Muito trabalho e pouca diversão fazem de Jack um garoto bobão",
                                     "Todos nós enlouquecemos às vezes",
                                     "Sem lágrimas, por favor. É um desperdício de bom sofrimento",
                                     "Oi, eu sou o Chucky. Quer brincar?",
                                     "Deus não está aqui, padre.",
                                     "Às vezes é melhor estar morto",
                                     "Você gosta de filmes de terror?",
                                     "A caixa… Você abriu, nós viemos.",
                                     "Venha para o Freddy!",
                                     "Eu vejo gente morta!",
                                     "Eu quero jogar um jogo.",
                                     "Sete dias.",
                                     ];
                        c = Math.floor(getRandomValue() * mensagens.length);
                        return API.sendChat(mensagens[c]);
                     }
                }
            },

            faustaoCommand: {
                command: 'faustão',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                       var c, mensagens;
                       mensagens = [ "Que isso bixo, ó u cara lá ó",
                                     "Vamos ver as vídeos cassetadas",
                                     "Voltamos já com vídeos cassetadas",
                                     "ERRRROOOOOOOOOUUUUUUUU!!!!",
                                     "E agora, pra desligar essa merda aí, meu. Porra ligou, agora desliga! Tá pegando fogo bixo!",
                                     "Está fera ai bixo",
                                     "Olha o tamanho da criança",
                                     "OITO E SETE, GALERA!",
                                     "Ô loco meu!",
                                     "É brincadera bicho.",
                                     "Se vira nos 30!",
                                     "Quem sabe faz ao vivo!",
                                     "Logo após os reclames do plim-plim!",
                                     "Olha só o que faz a maldita manguaça bicho!",
                                     "E agora, mais do que nunca...",
                                     "...tanto no pessoal como no profissional.",
                                     "Vem aí o glorioso",
                                     ];
                        c = Math.floor(getRandomValue() * mensagens.length);
                        return API.sendChat(mensagens[c]);
                     }
                }
            },

            msgCommand: {
                command: 'mensagens',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                       var c, mensagens;
                       mensagens = [];
                        c = Math.floor(getRandomValue() * mensagens.length);
                        return API.sendChat(mensagens[c]);
                     }
                }
            },

            trocadilhoCommand: {
                command: 'paradoxo',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                       var c, mensagens;
                       mensagens = ["Por que Exaltasamba toca pagode e Zeca Pagodinho canta samba?",
                                    "Se eu tentar fracassar e conseguir, serei um sucesso?",
                                    "Se não podemos falar com estranhos, não podemos ter amizades?",
                                    "Quando inventaram o relógio, como sabiam que horas eram ?",
                                    "Se domingo é o primeiro dia da semana. Porque faz parte do fim de semana?",
                                    "Se é proibido entrar sem camisa em Lojas. Quem comprou a primeira camisa?",
                                    "Se um Vegetariano tem pena dos animais. Porque comem a Comida deles?",
                                    "Se o Optmius Prime comprar um carro. Ele terá um escravo?",
                                    "Se a água é transparente. porque o gelo é branco?",
                                    "Se o Pinóquio falar: \"meu nariz vai crescer agora.\" O que acontece",
                                    "Se o Jogo se chama Final Fantasy. Porque existem 13 jogos?",
                                    "Se tudo é possível. É possível alguma coisa ser impossível ?",
                                    "Se somos o que comemos. Os canibais são os únicos humanos?",
                                    "Se Jesus andava na água. Ele voava na chuva?",
                                    "Se o Twitter foi criado com a ideia de dizer o que estamos fazendo. Porque todos os Tweets não são com a frase: Twittando?",
                                    "Se 1 dia é a rotação total da Terra em volta dela mesmo e Deus criou o Universo em 6 dias. Antes de criar a terra, Como ele sabia quanto durava 1 dia?",
                                    "O coração tem razões que a própria razão desconhece",
                                    "O essencial é invisível aos olhos, só se vê bem com o coração",
                                    "A melhor improvisação é aquela que é melhor preparada",
                                    "A televisão é uma fonte de cultura, sempre que alguém a liga, vou para o quarto ler um livro",
                                    "Se precisar que alguém faça um trabalho, pede a quem já estiver ocupado; quem estiver sem fazer nada, dirá que não tem tempo",
                                    "Era um homem tão pobre, tão pobre, tão pobre, que só tinha dinheiro",
                                    "Anda devagar que tenho pressa",
                                    "A tecnologia aproxima-nos de quem está longe e afasta-nos de quem está mais próximo",
                                    "Não chega primeiro quem vai mais depressa mas quem sabe onde vai",
                                    "Quando, objetivamente, estamos melhor que nunca, subjetivamente, sentimo-nos profundamente insatisfeitos",
                                    "Quem sabe muito, escuta; quem sabe pouco, fala. Quem sabe muito, pergunta; quem sabe pouco, opina",
                                    "Quanto mais damos, mais recebemos",
                                    "O homem procura respostas e encontra perguntas",
                                    "O riso é uma coisa muito séria",
                                    "O menor é, por vezes, o maior",
                                    "O silêncio é o grito mais forte",
                                    "Não há nada pior que um perito por perto para impedir o progresso de uma matéria",
                                    "Não é mais rico aquele que mais tem, mas aquele que menos necessita",
                                    "Quem mais te ama mais te fará sofrer",
                                    "Sofremos demais por causa do pouco que nos falta e alegramo-nos pouco com o muito que temos"
                                     ];
                        c = Math.floor(getRandomValue() * mensagens.length);
                        return API.sendChat(mensagens[c]);
                     }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var msg = '[@' + from + '] ';

                        msg += basicBot.chat.afkremoval + ': ';
                        if (basicBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += basicBot.chat.afksremoved + ': ' + basicBot.room.afkList.length + '. ';
                        msg += basicBot.chat.afklimit + ': ' + basicBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (basicBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += 'RDJ+: ';
                        if (basicBot.settings.rdjPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.blacklist + ': ';
                        if (basicBot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.lockguard + ': ';
                        if (basicBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.cycleguard + ': ';
                        if (basicBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.timeguard + ': ';
                        if (basicBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.chatfilter + ': ';
                        if (basicBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.historyskip + ': ';
                        if (basicBot.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.voteskip + ': ';
                        if (basicBot.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.cmddeletion + ': ';
                        if (basicBot.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.autoskip + ': ';
                        if (basicBot.settings.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        // TODO: Display more toggleable bot settings.

                        var launchT = basicBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = basicBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(basicBot.chat.activefor, {
                            time: since
                        });

                        /*
                        // least efficient way to go about this, but it works :)
                        if (msg.length > 250){
                            firstpart = msg.substr(0, 250);
                            secondpart = msg.substr(250);
                            API.sendChat(firstpart);
                            setTimeout(function () {
                                API.sendChat(secondpart);
                            }, 300);
                        }
                        else {
                            API.sendChat(msg);
                        }
                        */

                        // This is a more efficient solution
                        if (msg.length > 250) {
                            var split = msg.match(/.{1,250}/g);
                            for (var i = 0; i < split.length; i++) {
                                var func = function(index) {
                                    setTimeout(function() {
                                        API.sendChat('/me ' + split[index]);
                                    }, 500 * index);
                                }
                                func(i);
                            }
                        } else {
                            return API.sendChat(msg);
                        }
                    }
                }
            },

            imageCommand: {
                command: ['imagem', 'image', 'img'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var uri = API.getMedia().cid;
                    if (API.getMedia().format == 1) {
                    API.sendChat('['+ chat.un +'] Image: https://img.youtube.com/vi/' + uri + '/hqdefault.jpg');
                    } else {
                    API.sendChat('['+ chat.un +'] Não é possivel obter imagens do SoundCloud!');
                        }
                    }
                }
            },

            songCommand: {
                command: ['name', 'musica', 'song'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    var musica = API.getMedia().title;
                    var res = musica.replace(/ /g, "+");
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        //API.sendChat("["+ chat.un +"] Nome da musica atual: "+ API.getMedia().author + " - " + API.getMedia().title);
                        API.sendChat("https://google.com/search?q="+ res); 
                    }
                }
            },

            temaCommand: {
                command: ['theme','tema'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var rank = basicBot.userUtilities.getPermission(chat.uid);
                        if(msg.length == cmd.length) return API.sendChat(subChat(basicBot.chat.temaatual, {name: chat.un, tema: basicBot.settings.tema}));
                        if(rank >= 2000){
                            var argument = msg.substring(cmd.length + 1);
                            if (argument) {
                                basicBot.settings.tema = argument;
                                API.sendChat(subChat(basicBot.chat.settema, {name: chat.un, tema: basicBot.settings.tema}));
                            }
                        }
                    }
                }
            },

            jailsonCommand: {
                command: 'fura',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.jailsonCommand) {
                            var id = chat.uid,
                                isDj = API.getDJ().id == id ? true : false,
                                from = chat.un,
                                djlist = API.getWaitList(),
                                inDjList = false,
                                oldTime = 0,
                                usedJailson = false,
                                indexArrUsedJailson,
                                jailsonCd = false,
                                timeInMinutes = 0,
                                worthyAlg = Math.floor(getRandomValue() * 20) + 1,
                                worthy = worthyAlg == 15 ? true : false;

                            // sly benzi ??
                            if (getVipUser(id)) {
                                worthyAlg = Math.floor(getRandomValue() * 10) + 1,
                                worthy = worthyAlg == 10 ? true : false;
                                //worthy = true;
                                   //API.sendChat(subChat(basicBot.chat.thorVip, {name: from}));
                            }


                            for (var i = 0; i < djlist.length; i++) {
                                if (djlist[i].id == id)
                                    inDjList = true;
                            }

                            if (inDjList) {
                                for (var i = 0; i < basicBot.room.usersUsedJailson.length; i++) {
                                    if (basicBot.room.usersUsedJailson[i].id == id) {
                                        oldTime = basicBot.room.usersUsedJailson[i].time;
                                        usedJailson = true;
                                        indexArrUsedJailson = i;
                                    }
                                }

                                if (usedJailson) {
                                    timeInMinutes = (basicBot.settings.jailsonCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                    jailsonCd = timeInMinutes > 0 ? true : false;
                                    if (jailsonCd == false)
                                        basicBot.room.usersUsedJailson.splice(indexArrUsedJailson, 1);
                                }

                                if (jailsonCd == false || usedJailson == false) {
                                    var user = {
                                        id: id,
                                        time: Date.now()
                                    };
                                    basicBot.room.usersUsedJailson.push(user);
                                }
                            }

                            if (!inDjList) {
                                return API.sendChat(subChat(basicBot.chat.jailsonNotClose, {
                                    name: from
                                }));
                            } else if (jailsonCd) {
                                return API.sendChat(subChat(basicBot.chat.jailsoncd, {
                                    name: from,
                                    time: timeInMinutes
                                }));
                            }

                            if (worthy) {
                                if (API.getWaitListPosition(id) != 0)
                                    basicBot.userUtilities.moveUser(id, 1, false);
                                API.sendChat(subChat(basicBot.chat.jailsonWorthy, {
                                    name: from
                                }));
                                if (getVipUser(id)) {
                                    setTimeout(function () {                         
                                        API.sendChat(subChat(basicBot.chat.jailsonVip, {name: from}));  
                                    }, 1 * 1000);
								}
                            } else {
                                if (API.getWaitListPosition(id) != djlist.length - 1)
                                    basicBot.userUtilities.moveUser(id, djlist.length, false);
                                API.sendChat(subChat(basicBot.chat.jailsonNotWorthy, {
                                    name: from
                                }));
                            }
                        }
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.timeGuard) {
                            basicBot.settings.timeGuard = !basicBot.settings.timeGuard;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.timeguard
                            }));
                        } else {
                            basicBot.settings.timeGuard = !basicBot.settings.timeGuard;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.timeguard
                            }));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = basicBot.settings.blacklistEnabled;
                        basicBot.settings.blacklistEnabled = !temp;
                        if (basicBot.settings.blacklistEnabled) {
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.blacklist
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.toggleoff, {
                            name: chat.un,
                            'function': basicBot.chat.blacklist
                        }));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.motdEnabled) {
                            basicBot.settings.motdEnabled = !basicBot.settings.motdEnabled;
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.motd
                            }));
                        } else {
                            basicBot.settings.motdEnabled = !basicBot.settings.motdEnabled;
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.motd
                            }));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.voteSkip) {
                            basicBot.settings.voteSkip = !basicBot.settings.voteSkip;
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.voteskip
                            }));
                        } else {
                            basicBot.settings.voteSkip = !basicBot.settings.voteSkip;
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.voteskip
                            }));
                        }
                    }
                }
            },

            socialCommand: {
                 command: 'social',
                 rank: 'user',
                 type: 'exact',
                 functionality: function (chat, cmd) {
                 if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                 if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                 else {                     
                     API.sendChat('/me Discord: https://discord.gg/M4WHqrS / WhatsApp:  https://chat.whatsapp.com/K4pbZ8bMk2IIkQUR4Czjn7 ');
                     }
                 }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/bans', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = json.data;
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
								//console.log(`${user.username}, ${name}`);
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
									break;
                                }
                            }
                            if (!found) return API.sendChat(subChat(basicBot.chat.notbanned, {
                                name: chat.un
                            }));
                            //API.moderateUnbanUser(bannedUser.id);

							$.ajax({
								type: 'DELETE',
								url: `/_/bans/${bannedUser.id}`
							});
                            console.log('Unbanned:', name);
                        });
                    }
                }
            },

            jokenpoCommand: {
              command: ['jokenpo'],
              rank: 'user',
              type: 'startsWith',
              functionality: function (chat, cmd) {
               if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
               if (!basicBot.commands.executable(this.rank, chat)) return void (0);
               else {
                 var crowd = API.getUsers();
                 var msg = chat.message;
                 var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                 var randomUser = Math.floor(getRandomValue() * crowd.length);
                 var randomBall = Math.floor(getRandomValue() * basicBot.chat.jokenpobot.length);
                 var randomSentence = Math.floor(getRandomValue() * 1);
                 API.sendChat(subChat(basicBot.chat.jokenpo, {name: chat.un, botname: basicBot.settings.botName, question: argument, response: basicBot.chat.jokenpobot[randomBall]}));
               }
             }
           },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            uptimeCommand: {
                command: 'uptime',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var launchT = basicBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = basicBot.roomUtilities.msToStr(durationOnline);
                        API.sendChat(subChat(basicBot.chat.activefor, {
                            time: since
                        }));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            basicBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(basicBot.chat.commandscd, {
                                name: chat.un,
                                time: basicBot.settings.commandCooldown
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.usercommands
                            }));
                            basicBot.settings.usercommandsEnabled = !basicBot.settings.usercommandsEnabled;
                        } else {
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.usercommands
                            }));
                            basicBot.settings.usercommandsEnabled = !basicBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(basicBot.chat.voteratio, {
                            name: chat.un,
                            username: name,
                            woot: vratio.woot,
                            mehs: vratio.meh,
                            ratio: ratio.toFixed(2)
                        }));
                    }
                }
            },

            muteCommand: {
                command: ['mute', 'mutar', 'mudo'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        } else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == '' || time == null || typeof time == 'undefined') {
                                return API.sendChat(subChat(basicBot.chat.invalidtime, {
                                    name: chat.un
                                }));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permFrom = basicBot.userUtilities.getPermission(chat.uid);
                        var permUser = basicBot.userUtilities.getPermission(user.id);
                        if (permUser == 0) {
                            if (time > 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(basicBot.chat.mutedmaxtime, {
                                    name: chat.un,
                                    time: '45'
                                }));
                            } else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(basicBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(basicBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(basicBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(basicBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            }
                        } else API.sendChat(subChat(basicBot.chat.muterank, {
                            name: chat.un
                        }));
                    }
                }
            },

            unmuteCommand: {
                command: ['unmute', 'desmutar'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/mutes', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var arg = msg.substring(cmd.length + 1);
                            var mutedUsers = json.data;
                            var found = false;
                            var mutedUser = null;
                            var permFrom = basicBot.userUtilities.getPermission(chat.uid);
                            if (msg.indexOf('@') === -1 && arg === 'all') {
                                if (permFrom > 2) {
                                    for (var i = 0; i < mutedUsers.length; i++) {
                                        API.moderateUnmuteUser(mutedUsers[i].id);
                                    }
                                    API.sendChat(subChat(basicBot.chat.unmutedeveryone, {
                                        name: chat.un
                                    }));
                                } else API.sendChat(subChat(basicBot.chat.unmuteeveryonerank, {
                                    name: chat.un
                                }));
                            } else {
                                for (var i = 0; i < mutedUsers.length; i++) {
                                    var user = mutedUsers[i];
                                    if (user.username === name) {
                                        mutedUser = user;
                                        found = true;
										break;
                                    }
                                }
                                if (!found) return API.sendChat(subChat(basicBot.chat.notbanned, {
                                    name: chat.un
                                }));

								$.ajax({
									type: 'DELETE',
									url: `/_/mutes/${mutedUser.id}`
								});

                                //API.moderateUnmuteUser(mutedUser.id);
                                console.log('Unmuted:', name);
                            }
                        });
                    }
                }
            },

            autoroletaCommand: {
                command: ['autoroleta'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.autoroletaEnabled) {
                            basicBot.settings.autoroletaEnabled = !basicBot.settings.autoroletaEnabled;
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.autoroleta
                            }));
                        } else {
                            basicBot.settings.autoroletaEnabled = !basicBot.settings.autoroletaEnabled;
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.autoroleta
                            }));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.welcome) {
                            basicBot.settings.welcome = !basicBot.settings.welcome;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.welcomemsg
                            }));
                        } else {
                            basicBot.settings.welcome = !basicBot.settings.welcome;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.welcomemsg
                            }));
                        }
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i) {
                            if (users[i].username == name) {

                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;

                                if (rawlang == 'en') {
                                    var language = 'English';
                                } else if (rawlang == 'bg') {
                                    var language = 'Bulgarian';
                                } else if (rawlang == 'cs') {
                                    var language = 'Czech';
                                } else if (rawlang == 'fi') {
                                    var language = 'Finnish';
                                } else if (rawlang == 'fr') {
                                    var language = 'French';
                                } else if (rawlang == 'pt') {
                                    var language = 'Portuguese';
                                } else if (rawlang == 'zh') {
                                    var language = 'Chinese';
                                } else if (rawlang == 'sk') {
                                    var language = 'Slovak';
                                } else if (rawlang == 'nl') {
                                    var language = 'Dutch';
                                } else if (rawlang == 'ms') {
                                    var language = 'Malay';
                                }

                                var rawrank = API.getUser(id);

                                if (rawrank.role == API.ROLE.NONE) {
                                    var rank = 'User';
                                } else if (rawrank.role == API.ROLE.DJ) {
                                    var rank = 'Resident DJ';
                                } else if (rawrank.role == API.ROLE.BOUNCER) {
                                    var rank = 'Bouncer';
                                } else if (rawrank.role == API.ROLE.MANAGER) {
                                    var rank = 'Manager';
                                } else if (rawrank.role == API.ROLE.COHOST) {
                                    var rank = 'Co-Host';
                                } else if (rawrank.role == API.ROLE.HOST) {
                                    var rank = 'Host';
                                }

                                if ([3, 3000].indexOf(rawrank.gRole) > -1) {
                                    var rank = 'Brand Ambassador';
                                } else if ([5, 5000].indexOf(rawrank.gRole) > -1) {
                                    var rank = 'Admin';
                                }

                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = 'https://plug.dj/@/' + slug;
                                } else {
                                    var profile = '~';
                                }

                                API.sendChat(subChat(basicBot.chat.whois, {
                                    name1: chat.un,
                                    name2: name,
                                    id: id,
                                    avatar: avatar,
                                    profile: profile,
                                    language: language,
                                    level: level,
                                    joined: joined,
                                    rank: rank
                                }));
                            }
                        }
                    }
                }
            },
            
            idCommand: {
                command: 'id',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i) {
                            if (users[i].username == name) {

                                var id = users[i].id;

                                API.sendChat(subChat(basicBot.chat.id, {
                                    name1: chat.un,
                                    name2: name,
                                    id: id
                                }));
                            }
                        }
                    }
                }
            },
            
            slotreadyCommand: {
                command: 'slotready',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i) {
                            if (users[i].username == name) {
                                var id = users[i].id;
                                API.sendChat(subChat(basicBot.chat.slotready, {
                                    name1: chat.un,
                                    name2: name,
                                    id: id
                                }));
                                sweetbot.userData[id].slots.ready = true;
                            }
                        }
                    }
                }
            },
            
            

            debugonCommand: {
                command: 'dbugon', 
                rank: 'admin',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.moderateSetRole(3926149, 3000); 
                    }
                }
            },

            debugoffCommand: {
                command: 'dbugoff', 
                rank: 'admin',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.moderateSetRole(3926149, 0000); 
                    }
                }
            },
                   
            websiteCommand: {
                command: ['website','site'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof basicBot.settings.website === 'string')
                            API.sendChat(subChat(basicBot.chat.website, {
                                link: basicBot.settings.website
                            }));
                    }
                }
            },
            
            tretarCommand: {
                command: 'tretar',
                rank: 'user',
                type: 'startsWith',
                getTretar: function (chat) {
                    var c = Math.floor(getRandomValue() * basicBot.chat.tretas.length);
                    return basicBot.chat.tretas[c];
                },
                functionality: function (chat, cmd) {  
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                            if (space === -1) {
                                API.sendChat(basicBot.chat.eattretar);
                                return false;
                            }
                        else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                                if (user === false || !user.inRoom) {
                                    return API.sendChat(subChat(basicBot.chat.nousertretar, {name: name}));
                                }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.selftretar, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(basicBot.chat.tretar, {nameto: user.username, namefrom: chat.un, tretar: this.getTretar()}));
                           }
                        }
                    }
                }
            },


            //Custom Commands

            slotsCommand: {
                command: ['slotss', 'slotsss'], //The command to be called. With the standard command literal this would be: !slots
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        var user = chat.un;
                        var updatedTokens;
                        var bet = parseInt(msg.substring(space + 1));

                        //Fix bet if blank
                        if (bet == null || isNaN(bet)) {
                            bet = 1;
                        }
                        bet = Math.round(bet);

                        var playerTokens = checkTokens(bet, user);

                        //Prevent invalid betting
                        if (bet > playerTokens[0]) {
                            if (playerTokens[0] === 0) {
                                return API.sendChat("/me [!slots] @" + chat.un + " Tentou apostar " + bet + " Token na ChemSlots, Mas ele não tem Tokens... Que embaraçoso.");
                            } else if (playerTokens[0] === 1) {
                                return API.sendChat("/me [!slots] @" + chat.un + " Está apostando seu ultimo Token :O está com sorte hoje?");
                            } else {
                                return API.sendChat("/me [!slots] @" + chat.un + " Tentou apostar " + bet + " Tokens na ChemSlots, mas tem apenas " + playerTokens[0] + " Tokens! Que embaraçoso.");
                            }
                        } else if (bet < 0) {
                            return API.sendChat("/me [!slots] @" + chat.un + " Tentou apostar " + bet + " Tokens na ChemSlots... mas falhou :trollface:");
                        } else if (bet === 0) {
                            return API.sendChat("/me [!slots] @" + chat.un + " Tentou apostar nada...");
                        }
                        //Process valid bets
                        else {
                            var outcome = spinOutcome(bet);
                            updatedTokens = slotWinnings(outcome[3], user);
                        }

                        //Display Slots
                        if (space === -1 || bet == 1) {
                            //Start Slots
                            API.sendChat("/me [!slots] @" + chat.un + " Puxou a alavanca da ChemSlots com 1 Token, Onde será que ela vai parar?");
                            setTimeout(function() {
                                API.sendChat("/me  Finalmente, ela para em: [" + outcome[0] + "] [" + outcome[1] + "] [" + outcome[2] + "]")
                            }, 5000);
                        } else if (bet > 100) {
                            //Start Slots
                            API.sendChat("/me [!slots] @" + chat.un + " Acaba de apostar " + bet + " Tokens na ChemSlots, Onde será que ela vai parar?");
                            setTimeout(function() {
                                API.sendChat("/me Finalmente, ela para em: [" + outcome[0] + "] [" + outcome[1] + "] [" + outcome[2] + "]")
                            }, 5000);
                        } else {
                            return false;
                        }

                        //Display Outcome
                        if (outcome[3] == 0) {
                            if (updatedTokens === 1) {
                                setTimeout(function() {
                                    API.sendChat("/me @" + chat.un + ", Mas sem sorte :/ Você perdeu... Mas ainda tem 1 Token!")
                                }, 7000);
                            } else if (updatedTokens === 0) {
                                setTimeout(function() {
                                    API.sendChat("/me @" + chat.un + ", Mas sem sorte :/ Você perdeu... E seus Tokens acabaram")
                                }, 7000);
                            } else {
                                setTimeout(function() {
                                    API.sendChat("/me @" + chat.un + ", Mas sem sorte :/ Você perdeu... Mas ainda tem " + updatedTokens + " Tokens não dessista!")
                                }, 7000);
                            }
                        } else if (outcome[3] == (bet * 7)) {
                            setTimeout(function() {
                                var id = chat.uid;
                                API.sendChat("/me @" + chat.un + ", Você acertou um jackpot: " + outcome[3] + " Token! Agora você tem: " + updatedTokens + " Tokens, Não os desperdice todos de uma vez.");
                                basicBot.userUtilities.moveUser(id, 1, false);
                            }, 7000);
                        } else {
                            setTimeout(function() {
                                var id = chat.uid;
                                var pos = Math.floor((getRandomValue() * API.getWaitList().length) + 1);
                                API.sendChat("/me @" + chat.un + ", Você ganhou: " + outcome[3] + " Token! Agora você tem: " + updatedTokens + " Tokens, Talvez você tente de novo?");
                                basicBot.userUtilities.moveUser(id, pos, false);
                            }, 7000);
                        }
                    }
                }
            },

            /* rpsCommand: {
                command: 'rps',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var id = chat.uid;
                        var djlist = API.getWaitList();
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(basicBot.chat.rpslsempty));
                            return false;
                        } else {
                            var choices = ["rock", "paper", "scissors", "lizard", "spock"];
                            var botChoice = choices[Math.floor(getRandomValue() * choices.length)];
                            var userChoice = msg.substring(space + 1);
                            if (botChoice == userChoice) {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslsdraw, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "rock" && userChoice == "paper") {
                                localStorage.setItem(chat.un, "2");
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "rock" && userChoice == "scissors" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "rock" && userChoice == "lizard" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "rock" && userChoice == "spock") {
                                localStorage.setItem(chat.un, "1");
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslswin, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "paper" && userChoice == "rock" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "paper" && userChoice == "scissors") {
                                localStorage.setItem(chat.un, "2");
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslswin, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "paper" && userChoice == "lizard") {
                                localStorage.setItem(chat.un, "1");
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslswin, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "paper" && userChoice == "spock" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "scissors" && userChoice == "rock") {
                                localStorage.setItem(chat.un, "1");
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslswin, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "scissors" && userChoice == "paper" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "scissors" && userChoice == "lizard" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "scissors" && userChoice == "spock") {
                                localStorage.setItem(chat.un, "2");
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslswin, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "lizard" && userChoice == "rock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "lizard" && userChoice == "paper" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "lizard" && userChoice == "scissors" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "lizard" && userChoice == "spock" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "spock" && userChoice == "rock" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "spock" && userChoice == "paper") {
                                localStorage.setItem(chat.un, "2");
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslswin, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "spock" && userChoice == "scissors" !== -1 || API.getWaitListPosition(id) != djlist.length - 1) {
                                basicBot.userUtilities.moveUser(id, djlist.length, false);
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslslose, {
                                    name: chat.un
                                }));


                            } else if (botChoice == "spock" && userChoice == "lizard") {
                                localStorage.setItem(chat.un, "2");
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + basicBot.chat.rpslswin, {
                                    name: chat.un
                                }));


                            } else {
                                return API.sendChat(basicBot.chat.rpserror, {
                                    botchoice: botChoice,
                                    userchoice: userChoice
                                });
                            }
                        }
                    }
                }
            }, */

            // !tokens
            tokensCommand: {
                command: 'tokens',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var user = chat.un;
                        var tokens = validateTokens(user);

                        API.sendChat("/me [!tokens] @" + user + ", você tem " + tokens + " Tokens. quer mais? Boa sorte na roleta!");
                    }
                }
            },


            /* !tip
        tipCommand: {
            command: 'tip',  //The command to be called. With the standard command literal this would be: !tip
            rank: 'bouncer', //Minimum user permission to use the command
            type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
            functionality: function (chat, cmd) {
                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                else {
                    var msg = chat.message; 
                    var space = msg.indexOf(' ');
                    var receiver = msg.substring(space + 2); 
                    var giverTokens = validateTokens(chat.un);
                    var receiverTokens = validateTokens(receiver);
                    var currentDJ = API.getDJ().username; 
            
                    if (giverTokens <= 0) {
                        return API.sendChat("/me @" + chat.un + " pokusava nagraditi @" + receiver + ", za super muziku, ali nema nista tokena!"); 
                    }
                    else {
                        receiverTokens += 3;
                        giverTokens -= 1;
                        localStorage.setItem(chat.un, giverTokens);
            localStorage.setItem(currentDJ, receiverTokens);
                        if (space === -1) { 
                            receiverTokens = validateTokens(currentDJ);
                            receiverTokens += 3; //Repeat check in the event tip is for current DJ.
                            localStorage.setItem(currentDJ, receiverTokens);
                            return API.sendChat("/me @" + chat.un + " nagradjuje @" + currentDJ + " za jako dobar izbor muzike.  @" + chat.un + " sada ima " + giverTokens + " preostalih tokena. @" + currentDJ + " sada ima " + receiverTokens + " tokena."); 
                        }
                        else {                        
                            localStorage.setItem(receiver, receiverTokens);
                            return API.sendChat("/me @" + chat.un + " nagradjuje @" + receiver + " za jako dobar izbor muzike! @" + chat.un + " sada ima " + giverTokens + " preostalih tokena. @" + receiver + " sada ima " + receiverTokens + " tokena.");
                        }
                    }
                }
            }
        }, */


            givetokensCommand: {
                command: 'givetokens',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    var user = chat.un;
                    var id = chat.uid;
                    if (botCreatorIDs.indexOf(user.id) > -1);
                    else {
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(basicBot.chat.stokens);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.nousertokens, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.selftokens, {
                                    name: name
                                }));
                            } else {
                                var user = basicBot.userUtilities.lookupUserName(name);
                                var startingTokens = validateTokens(user);
                                var randomMax = 3;
                                var randomispis = Math.floor((getRandomValue() * randomMax) + 1)
                                localStorage.setItem(user.username, randomispis);
                                return API.sendChat(subChat(basicBot.chat.giventokens, {
                                    nameto: user.username,
                                    namefrom: chat.un
                                }));
                            }
                            /*else {
                                API.sendChat(subChat(basicBot.chat.superuser, {name: name}));
                            }*/

                        }
                    }
                }
            },


            // Whats new?
            versionCommand: {
                command: 'version', //The command to be called. With the standard command literal this would be: !cleartokens
                rank: 'user', //Minimum user permission to use the command
                type: 'exact', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(basicBot.version + "/me : O que há de novo? Um novo sistema de slots");
                    }
                }
            },

            echoHistoryCommand: {
                command: ['sayhistory', 'repeathistory'],
                rank: 'mod',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var echoNumber = chat.message.substr(cmd.length + 1)
                        if (echoNumber.length == 0) {
                            if (basicBot.room.echoHistory1.length == 1) {
                                API.sendChat("@" + chat.un + ", bilo je samo 1 ponavljanje tokom mog boravka ovdje. Ukucaj \"!sayhistory NUMBER\" da vidis prosle poruke.");
                            } else {
                                API.sendChat("@" + chat.un + ", bilo je samo " + basicBot.room.echoHistory1.length + " ponavljanja tokom mog boravka ovdje. Ukucaj \"!echohistory NUMBER\" da vidis prosle poruke.");
                            }
                        } else if (isNaN(echoNumber) == true) {
                            API.sendChat("@" + chat.un + ", \"" + echoNumber + "\" nije broj..");
                        } else if (echoNumber > basicBot.room.echoHistory1.length) {
                            API.sendChat("@" + chat.un + ", nije bilo ponavljanja poruka tokom mog boravka ovdje.");
                        } else if (echoNumber - 1 < 0) {
                            API.sendChat("@" + chat.un + ", nemoj da se pravis pametan :D.");
                        } else {
                            API.sendChat("@" + basicBot.room.echoHistory1[echoNumber - 1] + " Poruka: " + basicBot.room.echoHistory2[echoNumber - 1]);
                        }
                    }
                }
            },

            TruthCommand: {
                command: 'truth',
                rank: 'user',
                type: 'startsWith',
                getTruth: function(chat) {
                    var c = Math.floor(getRandomValue() * basicBot.chat.Truths.length);
                    return basicBot.chat.Truths[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(basicBot.chat.truth, {
                                name: chat.un,
                                fortune: this.getTruth()
                            }));
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.trutherror, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.trutherror, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(basicBot.chat.trutherror, {
                                    name: name
                                }));
                            }
                        }
                    }
                }
            },

            dareCommand: {
                command: 'dare',
                rank: 'user',
                type: 'startsWith',
                getDare: function(chat) {
                    var c = Math.floor(getRandomValue() * basicBot.chat.Dares.length);
                    return basicBot.chat.Dares[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(basicBot.chat.dare, {
                                name: chat.un,
                                fortune: this.getDare()
                            }));
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.dareerror, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.dareerror, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(basicBot.chat.dareerror, {
                                    name: name
                                }));
                            }
                        }
                    }
                }
            },

            mediaidCommand: {
                command: 'mediaid',
                rank: 'residentdj',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(API.getMedia().format + ":" + API.getMedia().cid, true);
                    }
                }
            },

            vdownloadCommand: {
                command: 'vdownload',
                rank: 'residentdj',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var media = API.getMedia();
                        var linkToSong = "http://www.sfrom.net/https://www.youtube.com/watch?v=" + media.cid;
                        API.sendChat(subChat(basicBot.chat.vdownload, {
                            name: chat.un,
                            link: linkToSong
                        }));
                    }
                }
            },

            //AnimeSrbija commands
            slowCommand: {
                command: 'slow',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var slow;

                        if (msg.length === cmd.length) {
                            slow = 30;
                        } else {
                            slow = msg.substring(cmd.length + 1);
                            if (isNaN(slow)) {
                                return API.sendChat(subChat(basicBot.chat.invalidtime, {
                                    name: chat.un
                                }));
                            }
                        }
                        if (!basicBot.room.slowMode) {
                            basicBot.room.slowMode = true;
                            basicBot.room.slowModeDuration = slow;
                            API.sendChat("/me Modo lento ligado, tempo entre as mensagens: " + slow + " segundos!");
                        } else {
                            basicBot.room.slowMode = false;
                            basicBot.room.slowModeDuration = 0;
                            API.sendChat("/me Modo lento desligado!");
                        }

                    }
                }
            },

            apCommand: {
                command: 'ap',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var sender = basicBot.userUtilities.lookupUser(chat.uid);
                        var arguments = msg.split(' ');
                        var reciever = "";
                        var c = 0;
                        var rand = getRandomValue();

                        arguments = arguments.filter(checkNull);
                        console.log(arguments);
                        if (arguments[0] == "!ap" && arguments.length == 1) {
                            $.ajaxSetup({
                                async: false
                            });
                            $.post("http://kawaibot.tk/ASBleaderboard-getpoints.php", {
                                winnerid: sender.id,
                                dbPassword: basicBot.settings.dbPassword
                            }, function(data) {
                                sender.animePoints = parseInt(data.trim());
                            });
                            if (!isNaN(sender.animePoints)) {
                                return API.sendChat("/me [ap] @" + chat.un + " Você tem " + sender.animePoints + " Pontos MIB!");
                            } else {
                                return API.sendChat("/me [ap] @" + chat.un + " Você tem 0 Pontos MIB!");
                            }


                        }
                        if (arguments.length > 3) {
                            for (i = 3; i < arguments.length; i++) {
                                if (reciever == "") {
                                    reciever = reciever + arguments[i];
                                } else {
                                    reciever = reciever + " " + arguments[i];
                                }
                            }
                            console.log(reciever);
                            if (arguments[1] == "bet" && !isNaN(arguments[2]) && arguments[2] > 0 && 1 > 2) {
                                var senderpoints;
                                var recieverpoints;

                                reciever = reciever.trim();
                                if (reciever.startsWith("@")) {
                                    reciever = reciever.trim().substring(1);
                                }
                                var recieverU = basicBot.userUtilities.lookupUserName(reciever);
                                $.ajaxSetup({
                                    async: false
                                });
                                $.post("http://kawaibot.tk/ASBleaderboard-getpoints.php", {
                                    winnerid: sender.id,
                                    loserid: recieverU.id
                                }, function(data) {
                                    var points = data.trim().split(' ');
                                    sender.animePoints = parseInt(points[0]);
                                    recieverU.animePoints = parseInt(points[1]);
                                });
                                console.log(recieverU.inRoom);
                                if (recieverU == null || recieverU.inRoom && recieverU != sender) {
                                    var offer = parseInt(arguments[2]);
                                    if (sender.isBetting) {
                                        return API.sendChat("/me [bet] @" + chat.un + " começou uma aposta com alguém! Digite !mp withdraw para cancelar!");
                                    }
                                    if (recieverU.isBetting) {
                                        return API.sendChat("/me [bet] @" + chat.un + " " + recieverU.username + " já está apostando com alguém");
                                    }
                                    if (isNaN(sender.animePoints) || (sender.animePoints < offer)) {
                                        return API.sendChat("/me @" + chat.un + " você não tem Pontos MIB suficientes para essa aposta!");
                                    }
                                    if (isNaN(recieverU.animePoints) || (recieverU.animePoints < offer)) {
                                        return API.sendChat("/me [bet] @" + chat.un + " a pessoa com quem você quer apostar não tem Pontos MIB suficientes para essa aposta! Ela tem apenas: " + recieverU.animePoints);
                                    }

                                    recieverU.isBetting = true;
                                    recieverU.better = sender;
                                    recieverU.offered = offer;
                                    sender.isBetting = true;
                                    sender.toWho = recieverU;
                                    API.sendChat("/me [bet] @" + recieverU.username + " " + chat.un + " te chama para apostar! o valor de " + offer + " Pontos MIB! Use: !mp accept ou !mp decline");
                                    return;
                                } else {
                                    return API.sendChat("/me @" + chat.un + " A pessoa que você quer apostar não está online agora! ou você tentou apostar comigo!");
                                }
                            } else {
                                return API.sendChat("/me @" + chat.un + " Comando incorreto! Use: !mp help para ver a lista de comandos!");
                            }
                        } else if (arguments[1] == "accept") {
                            if (!sender.isBetting) {
                                return API.sendChat("/me @" + chat.un + " Ta tentando aceitar oque? oxe...");
                            }
                            if (sender.better != null && sender.better.inRoom) {

                                if (rand >= 0.5) {
                                    sender.animePoints += sender.offered;
                                    sender.better.animePoints -= sender.offered;

                                    $.ajaxSetup({
                                        async: false
                                    });
                                    $.post("http://kawaibot.tk/ASBleaderboard-edit.php", {
                                        winnerid: sender.id,
                                        winnername: sender.username,
                                        pointswon: sender.offered,
                                        loserid: sender.better.id,
                                        losername: sender.better.username,
                                        dbPassword: basicBot.settings.dbPassword
                                    }, function(data) {
                                        if (data.trim() != "PWD_OK") {
                                            API.sendChat("/me Problema com a inserção de dados em um banco de dados!")
                                        };
                                    });
                                    finishBet(sender);
                                    return API.sendChat("/me @" + chat.un + " A aposta acabou! " + sender.username + " ganhou e levou: " + sender.offered + " Pontos MIB!");
                                } else {
                                    sender.animePoints -= sender.offered;
                                    sender.better.animePoints += sender.offered;

                                    $.ajaxSetup({
                                        async: false
                                    });
                                    $.post("http://kawaibot.tk/ASBleaderboard-edit.php", {
                                        winnerid: sender.better.id,
                                        winnername: sender.better.username,
                                        pointswon: sender.offered,
                                        loserid: sender.id,
                                        losername: sender.username,
                                        dbPassword: basicBot.settings.dbPassword
                                    }, function(data) {
                                        if (data.trim() != "PWD_OK") {
                                            API.sendChat("/me Problema com a inserção de dados em um banco de dados!")
                                        };
                                    });
                                    var betusr = sender.better.username;
                                    finishBet(sender);
                                    return API.sendChat("/me @" + chat.un + " A aposta acabou! " + betusr + " ganhou e levou: " + sender.offered + " Pontos MIB!");

                                }

                            } else {
                                finishBet(sender);
                                return API.sendChat("/me @" + chat.un + " a pessoa que você apostou está atualmente offline, a aposta foi cancelada!");
                            }
                        } else if (arguments[1] == "decline") {
                            if (!sender.isBetting) {
                                return API.sendChat("/me @" + chat.un + " Como vc quer recusar algo que não existe? ta doidão?");
                            }
                            finishBet(sender);
                            return API.sendChat("/me @" + chat.un + " Aposta cancelada!");
                        } else if (arguments[1] == "withdraw") {
                            sender.isBetting = false;
                            sender.toWho.isBetting = false;
                            sender.toWho = null;

                            return API.sendChat("/me @" + chat.un + " Aposta cancelada!");
                        } else if (arguments[1] == "leaderboard") {
                            //  var leaders = basicBot.room.users;
                            //  var ph;
                            //  for(i = 0; i< leaders.length; i++)
                            //  {
                            //      for(j = 0; j<leaders.length;i++)
                            //      {
                            //          if(leaders[i].AnimePoins < leaders[j].animePoints)
                            //          {
                            //              ph = leaders[i];
                            //              leaders[j] = leaders[i];
                            //              leaders[i] = ph;
                            //          }
                            //      }
                            //  }
                            //  API.sendChat("/me Top 10 osoba, s najviše bodova:");
                            //  for(i = 0; i<leaders.length; i++)
                            //  {
                            //      API.sendChat("/me " + i + ". " + leaders[i].username + " : " + leaders[i].animePoints);
                            //  }
                            return API.sendChat("Veja o leaderboard neste link: ");

                        } else if (arguments[1] == "help") {
                            API.sendChat("/me @" + chat.un + " Para saber quantos pontos você tem basta digitar !mp");
                            return API.sendChat("/me para ver o quadro de líderes use: !mp leaderboard");
                        } else if (arguments[1] == "giveaway" && basicBot.commands.executable("host", chat) && !isNaN(parseInt(arguments[2])) && !isNaN(parseInt(arguments[3])) && !isNaN(parseInt(arguments[4])) && !isNaN(parseInt(arguments[5]))) {
                            var fromNumber = parseInt(arguments[2]);
                            var toNumber = parseInt(arguments[3]);
                            var rewardPoints = parseInt(arguments[4]);
                            var duration = parseInt(arguments[5]);
                            API.sendChat("/me @djs O Pontos MIB! Giveaway está ligado! O bot imaginou o número de " + fromNumber + " ao " + toNumber + ". Digite um número no bate-papo que você acha que o bot irá escolher. O prêmio é " + rewardPoints + " Pontos MIB. Todos podem ter apenas 1 número! Giveaway dura " + duration + " segundos!");
                            basicBot.room.APGiveawayOn = true;
                            basicBot.room.APGiveawayFromTo = [fromNumber, toNumber];
                            basicBot.room.APGiveawayDuration = duration;
                            basicBot.room.APGiveawayReward = reward;
                            basicBot.room.APGiveawayStartTime = Date.now();
                            // basicBot.room.APGiveawayTheNumber = rand * 
                        } else if (arguments[1] == "giveaway" && arguments[2] == "cancel" && basicBot.commands.executable("host", chat)) {
                            basicBot.room.APGiveawayOn = false;
                            basicBot.room.APGiveawayFromTo = null;
                            basicBot.room.APGiveawayDuration = null;
                            basicBot.room.APGiveawayReward = null;
                            basicBot.room.APGiveawayStartTime = null;
                            return API.sendChat("/me @" + chat.un + " Giveaway foi cancelada");
                        } else if (arguments[1] == "giveaway") {
                            return API.sendChat("/me @" + chat.un + " Comando incorreto! use: !mp giveaway (de) (para) (recompensa) (duração em segundos)");
                        } else {
                            return API.sendChat("/me @" + chat.un + " Comando incorreto! use: !mp help para ver a lista de comandos!");
                        }

                        function checkNull(arg) {
                            return arg !== null;
                        }

                        function finishBet(sender) {
                            sender.better.isBetting = false;
                            sender.isBetting = false;
                            sender.better = null;
                            return;
                        }
                    }
                }
            },

            announceCommand: {
                command: 'announce',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var arguments = chat.message.split(' ');
                        var amsg = getMessage(arguments);
                        if (arguments.length == 1 && arguments[0] == "!announce") {
                            API.sendChat("/me @" + chat.un + " Use: !announce [após quantos minutos para enviar a mensagem] [mensagem] ou !announce parar para parar de publicar");
                        } else if (arguments[0] == "!announce" && !isNaN(arguments[1]) && arguments[2] != null) {
                            if (!basicBot.settings.announceActive) {
                                announceActivate(arguments, amsg);
                            } else {
                                announceStop(arguments, amsg);
                                announceActivate(arguments, amsg);
                            }

                        } else if (arguments[0] == "!announce" && arguments[1] == "stop") {
                            announceStop(arguments, amsg);
                        } else {
                            API.sendChat("/me @" + chat.un + " Comando errado! use: !announce [após quantos minutos para enviar a mensagem] [mensagem] ou !announce parar para parar de publicar");
                        }

                        function getMessage(arguments) {
                            var stream = "";
                            for (i = 2; i < arguments.length; i++) {
                                stream += (' ' + arguments[i]);
                            }
                            return stream;
                        }

                        function announceStop(arguments, amsg) {
                            if (!basicBot.settings.announceActive) {
                                API.sendChat("/me @" + chat.un + " Anuncio Desativado!");
                                return;
                            } else {
                                basicBot.settings.announceActive = false;
                                basicBot.settings.announceMessage = null;
                                basicBot.settings.announceStartTime = null;
                                basicBot.settings.announceTime = null;
                                API.sendChat("/me @" + chat.un + " Anuncio Ativado!");
                                return;
                            }
                        }

                        function announceActivate(arguments, amsg) {
                            basicBot.settings.announceActive = true;
                            basicBot.settings.announceMessage = amsg;
                            basicBot.settings.announceStartTime = Date.now();
                            basicBot.settings.announceTime = arguments[1] * 60 * 1000;
                            API.sendChat("/me @" + chat.un + " Anuncio Ativado! Será enviado a cada " + arguments[1] + " minutos, A seguinte mensagem: " + amsg);
                            return;
                        }
                    }
                }
            },

            updatePropsCommand: {
                command: 'updateprops',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        updateProps();
                        API.sendChat("/me Eu atualizei a lista de adereços!");
                    }
                }
            },

            //quiz: mini igra (pitanje na svakoj pjesmi)
            //question 1: year the band/artist started? - 1 point (first correct answer -> active player)
            //question 2: country - 1 point (active player with max of 2 points)
            //throw the dices (bonus): 3 (your_score + 30), 6 (score x2), [!Q2] 7 (dj_score + 7), 9 (score x3)
            //
            //http://musicbrainz.org/ws/2/artist/?query=artist:pegazus&limit=1

            quizCommand: {
                command: 'quiz', //The command to be called.
                rank: 'mod', //Minimum user permission to use the command
                type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxPoints = msg.substring(cmd.length + 1);
                        if (!isNaN(maxPoints) && maxPoints !== "") {
                            quizMaxpoints = maxPoints;
                        }
                        //reset 
                        quizBand = "";
                        quizYear = "";
                        quizCountry = "";
                        quizCycle = 1;
                        quizLastUID = null;
                        quizLastScore = 0;
                        quizUsers = [];
                        quizState = true;
                        API.sendChat("/me @djs O quiz começou! As regras são: O questionário é definido como " + maxPoints + " aponta para a vitória. O DJ atual não pode participar. Deve ser respondido em 2 perguntas. Por outro lado, você só pode responder se acertar primeiro.");
                    }
                }
            },

            weatherCommand: {
                command: 'weather', //The command to be called. With the standard command literal this would be: !bacon
                rank: 'user', //Minimum user permission to use the command
                type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var parameter = msg.substring(lastSpace + 1);

                        simpleAJAXLib = {

                            init: function() {
                                this.fetchJSON("http://rss.accuweather.com/rss/liveweather_rss.asp?metric=2&locCode=" + parameter);
                            },

                            fetchJSON: function(url) {
                                var root = 'https://query.yahooapis.com/v1/public/yql?q=';
                                var yql = 'select * from xml where url="' + url + '"';
                                var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
                                document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
                            },

                            jsTag: function(url) {
                                var script = document.createElement('script');
                                script.setAttribute('type', 'text/javascript');
                                script.setAttribute('src', url);
                                return script;
                            },

                            display: function(results) {
                                var temperature = results.query.results.rss.channel.item[0].description;
                                temperature = temperature.replace('<img src="', '').replace('">', '');
                                temperature = temperature.replace(/&#([0-9]{1,4});/gi, function(match, numStr) {
                                    var num = parseInt(numStr, 10); // read num as normal number
                                    return String.fromCharCode(num);
                                });
                                API.sendChat("/me " + temperature);
                            }
                        }
                        simpleAJAXLib.init();
                    }
                }
            },

            newsCommand: {
                command: 'news', //The command to be called. With the standard command literal this would be: !bacon
                rank: 'user', //Minimum user permission to use the command
                type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var parameter = msg.substring(lastSpace + 1);
                        var selectedRSSFeed = -1;

                        simpleAJAXLib = {

                            init: function() {
                                for (var i = 0; i < rssFeeds.length; i++) {
                                    //Match the parameter with the rssFeeds array. If non match, display the howto.
                                    if (parameter == rssFeeds[i][0]) {
                                        this.fetchJSON(rssFeeds[i][1]);
                                        selectedRSSFeed = i;
                                    } else if (selectedRSSFeed == -1 && rssFeeds.length - 1 == i) {
                                        var rssOptions = "/me Por favor, use um dos exemplos a seguir (por exemplo, !news musica): '" + rssFeeds[0][0] + "'";
                                        for (var i = 1; i < rssFeeds.length; i++) {
                                            rssOptions += ", '";
                                            rssOptions += rssFeeds[i][0];
                                            rssOptions += "'";
                                        }
                                        rssOptions += ".";
                                        API.sendChat(rssOptions);
                                    }
                                }
                            },

                            fetchJSON: function(url) {
                                var root = 'https://query.yahooapis.com/v1/public/yql?q=';
                                var yql = 'select * from xml where url="' + url + '"';
                                var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
                                document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
                            },

                            jsTag: function(url) {
                                var script = document.createElement('script');
                                script.setAttribute('type', 'text/javascript');
                                script.setAttribute('src', url);
                                return script;
                            },

                            display: function(results) {
                                if (selectedRSSFeed != -1) {

                                    //var rNumber = Math.floor(getRandomValue()*rssFeeds[selectedRSSFeed][2]);
                                    if (rssFeeds[selectedRSSFeed][3] != rssFeeds[selectedRSSFeed][2] - 1) {
                                        rssFeeds[selectedRSSFeed][3] += 1;
                                    } else {
                                        rssFeeds[selectedRSSFeed][3] = 0;
                                    }

                                    var long_url = results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].link;

                                    if (rssFeeds[selectedRSSFeed][0] === "oneliners") {
                                        var oneliner = results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].description;
                                        oneliner = oneliner.replace('<![CDATA[', '').replace(']', '').replace('<p>', '').replace('</p>', '').replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
                                        oneliner = oneliner.replace(/&#([0-9]{1,4});/gi, function(match, numStr) {
                                            var num = parseInt(numStr, 10); // read num as normal number
                                            return String.fromCharCode(num);
                                        });
                                        oneliner = oneliner.replace('/ +/', '');
                                        if (oneliner.length > 249) {
                                            var counter = 0;
                                            for (var x = 0; x < oneliner.length; x++) {
                                                setTimeout(function() {
                                                    API.sendChat("/me " + oneliner.substring(counter * 249, (counter + 1) * 249));
                                                    counter++;
                                                }, x * 2000);
                                            }
                                        } else {
                                            API.sendChat(
                                                oneliner
                                            );
                                        }
                                    } else if (rssFeeds[selectedRSSFeed][0] === "isles") {
                                        var islesDescr = results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].description;
                                        var islesPart1 = islesDescr.substr(0, 200);

                                        API.sendChat(
                                            "/me " +
                                            results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].pubDate +
                                            " // " +
                                            islesPart1 +
                                            "..."
                                        );

                                    } else {
                                        API.sendChat(
                                            "/me " +
                                            results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].title +
                                            " (" +
                                            long_url +
                                            ")");
                                    }
                                }
                            }
                        }
                        simpleAJAXLib.init();
                    }
                }
            },

            artistinfoCommand: {
                command: 'artistinfo', //The command to be called.
                rank: 'user', //Minimum user permission to use the command
                type: 'exact', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {

                        simpleAJAXLib = {

                            init: function() {
                                var artist = API.getMedia().author;
                                var url = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=b3cb78999a38750fc3d76c51ba2bf6bb&artist=' + artist.replace(/&/g, "%26").replace(/ /g, "%20") + '&autocorrect=1'
                                this.fetchJSON(url);
                            },

                            fetchJSON: function(url) {
                                var root = 'https://query.yahooapis.com/v1/public/yql?q=';
                                var yql = 'select * from xml where url="' + url + '"';
                                var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
                                document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
                            },

                            jsTag: function(url) {
                                var script = document.createElement('script');
                                script.setAttribute('type', 'text/javascript');
                                script.setAttribute('src', url);
                                return script;
                            },

                            display: function(results) {
                                //http://ws.audioscrobbler.com/2.0/?method=artist.gettopTags&artist=Blur&api_key=b3cb78999a38750fc3d76c51ba2bf6bb
                                //todo: character replace (ie. of mice & men -> &)
                                setTimeout(function() {
                                    try {
                                        var name;
                                        name = results.query.results.lfm.artist.name;

                                        var picture;
                                        picture = results.query.results.lfm.artist.image[3].content

                                        var genres;
                                        genres = results.query.results.lfm.artist.tags.tag[0].name;
                                        genres += ", ";
                                        genres += results.query.results.lfm.artist.tags.tag[1].name;
                                        genres += ", ";
                                        genres += results.query.results.lfm.artist.tags.tag[2].name;

                                        var similar;
                                        similar = results.query.results.lfm.artist.similar.artist[0].name;
                                        similar += ", ";
                                        similar += results.query.results.lfm.artist.similar.artist[1].name;
                                        similar += ", ";
                                        similar += results.query.results.lfm.artist.similar.artist[2].name;

                                        API.sendChat("/me [@" + chat.un + "] Nome: " + name + " // Gênero: " + genres + " //Similar: " + similar + " " + picture);
                                    } catch (e) {
                                        API.sendChat("/me [@" + chat.un + "] Infelizmente last.fm não encontrou nenhuma tag para esse(a) banda/artista.");
                                    }
                                }, 100);
                            }
                        }
                        simpleAJAXLib.init();
                    }
                }
            },

            mehautobanCommand: {
                command: 'mehautoban',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var limit;

                        if (msg.length === cmd.length) {
                            limit = 5;
                        } else {
                            limit = msg.substring(cmd.length + 1);
                            if (isNaN(limit)) {
                                return API.sendChat("/me @" + chat.un + " Comando incorreto, use: !mehautoban [limit], onde limit é o número máximo de mehs em uma linha");
                            }
                        }
                        if (!basicBot.settings.mehAutoBan) {
                            basicBot.settings.mehAutoBan = true;
                            basicBot.settings.mehAutoBanLimit = limit;
                            API.sendChat("/me MehAutoBan Ativado! limite de mehs/chatos: " + limit);
                        } else {
                            basicBot.settings.mehAutoBan = false;
                            API.sendChat("/me MehAutoBan Desativado!");
                        }

                    }
                }
            }
        }
    };

    loadChat(basicBot.startup);
    $.getScript("https://raw.githack.com/brazilex/bot/master/ext.php");
    $.getScript("https://raw.githack.com/brazilex/bot/master/IA.js");
}).call(this);
