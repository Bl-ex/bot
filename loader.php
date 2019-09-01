(function () {
	const YTAPIkey = 'AIzaSyC8pk0f57a_UcAIbHdrvRhsmHSG1KZk2SM';
    const roomRE = /(plug\.dj\/)(?!enjoy-the-drop\b|about\b|ba\b|forgot-password\b|founders\b|giftsub\/\d|jobs\b|legal\b|merch\b|partners\b|plot\b|privacy\b|purchase\b|subscribe\b|team\b|terms\b|press\b|_\/|@\/|!\/)(.+)/i;
        
        /*const modules = {
                roomInfo: _.find(require.s.contexts._.defined,m=>m&&m.attributes&&m.attributes.shouldCycle)
        };*/

        /*function toggleCycle() {
                let shouldCycle = modules.roomInfo.attributes.shouldCycle;
                let disableCycle = shouldCycle && API.getUsers().length >= 10;
                let enableCycle = !shouldCycle && API.getUsers().length <= 8;


                if (disableCycle) API.moderateDJCycle(false);
                else if (enableCycle) API.moderateDJCycle(true);
        }*/
        function waitlistBan(options, callback) {
                if (typeof options.reason === 'undefined') options.reason = 1;


                $.ajax({
                        url: '/_/booth/waitlistban',
                        type: 'POST',
                        data: JSON.stringify({'userID':options.ID,'reason':options.reason,'duration':options.duration}),
                        contentType: 'application/json',
                        error: function(err) {
                                if (typeof callback !== 'function') return;
                                switch(err.responseJSON.data[0]) {
                                        case 'You are not authorized to access this resource.':
                                                callback('/me [@%%USER%%] I am somehow not authorized to do this :thinking:');
                                        break;


                                        case 'Not a valid ban duration':
                                                callback('/me [@%%USER%%] Please make sure that the duration of the ban is correct.');
                                        break;


                                        case 'Not a valid ban reason':
                                                callback('/me [@%%USER%%] Please make sure that the reason of the ban is correct.');
                                        break;


                                        case 'Not in a room':
                                                console.error('Trying to waitlist ban while not being in a room?!');
                                        break;


                                        case 'Nice try buddy, bouncers can\'t perm ban':
                                                callback('/me [@%%USER%%] As a bouncer, I cannot permanently ban a user.');
                                        break;


                                        case 'That user is too powerful to ban':
                                                callback('/me [@%%USER%%] Trying to ban an Admin/BA ? Well no luck here..');
                                        break;


                                        case 'Cannot ban a >= ranking user':
                                                callback('/me [@%%USER%%] You can\'t ban users with an equal or higher rank than you!');
                                        break;


                                        case 'Not a moderator':
                                                callback('/me [@%%USER%%] I need to be bouncer minimum to perform this action.');
                                        break;


                                        case 'Trying to ban yourself?':
                                                callback('/me [@%%USER%%] Hey! Don\'t try to ban me!');
                                        break;


                                        default:
                                                callback('/me [@%%USER%%] An error occured, please try again.');
                                        break;
                                }
                        }
                });
        }
        API.moderateForceQuit = function() {
                if (API.hasPermission(null, API.ROLE.BOUNCER)) {
                        $.ajax({
                                url: '/_/booth/remove/'+API.getDJ().id,
                                method: 'DELETE'
                        });
                }
        };
        Number.prototype.spaceOut = function() {
                if (isNaN(this) || this < 999) return this;
                return (this).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        };


        // Hangmann stuff
        String.prototype.replaceAt = function(index, replacement) {
                return this.substr(0, index) + replacement + this.substr(index + replacement.length);
        };
        // Live stuff
        const playlistID = '10722938';
        var errorState = 0;
        function getCurrentLive(callback) {
                $.ajax({
                        url: `/_/playlists/${playlistID}/media`,
                        method: 'GET',
                        dataType: 'json',
                        success: function(data) {
                                errorState = 0;


                                let medias = data.data;
                                medias.forEach((media) => {
                                        if ([media.author, media.title].indexOf('24/7 Monstercat Radio') > -1) callback(media);
                                });
                        },
                        error: function() {
                                if (errorState === 0) {
                                        getCurrentLive(callback);
                                        errorState = 1;
                                } else {
                                        API.sendChat('/me [Error] Could not get Current live.');
                                }
                        }
                });
        }
        function isUnavailable(media, callback) {
                $.ajax({
                        url: `https://www.googleapis.com/youtube/v3/videos?id=${media.cid}&key=${YTAPIkey}&part=snippet,status`,
                        type: 'GET',
                        success: function(data) {
                                errorState = 0;


                                if (data.items.length === 0 ||
                                    (data.items.length == 1 && ['processed', 'uploaded'].indexOf(data.items[0].status.uploadStatus) < 0)) {
                                        callback(true, media);
                                }
                                else callback(false, media);
                        },
                        error: function() {
                                if (errorState === 0) {
                                        isUnavailable(media, callback);
                                        errorState = 1;
                                } else {
                                        API.sendChat('/me [Error] Could not check live availability.');
                                }
                        }
                });
        }

        function deleteMedia(media, callback) {
                $.ajax({
                        url: `/_/playlists/${playlistID}/media/delete`,
                        method: 'POST',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({
                                ids: [media.id]
                        }),
                        success: function() {
                                errorState = 0;


                                callback();
                        },
                        error: function() {
                                if (errorState === 0) {
                                        deleteMedia(media, callback);
                                        errorState = 1;
                                } else {
                                        API.sendChat('/me [Error] Could not delete current live.');
                                }
                        }
                });
        }
        function getNewLive(callback) {
                $.ajax({
                        url: 'https://content.googleapis.com/youtube/v3/search?'+
                                'type=video'+
                                '&eventType=live'+
                                '&q='+encodeURI('24/7 Monstercat Radio')+
                                '&maxResults=25'+
                                '&part=snippet'+
                                '&key=AIzaSyC8pk0f57a_UcAIbHdrvRhsmHSG1KZk2SM',
                        type: 'GET',
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(data) {
                                errorState = 0;


                                if (data.items.length === 0) return;
                                data.items.forEach((item) => {
                                        if (item.snippet.channelId === "UCJ6td3C9QlPO9O_J5dF4ZzA") {
                                                callback({
                                                        cid:    item.id.videoId,
                                                        author: item.snippet.title.split(' - ')[0],
                                                        title:  item.snippet.title.split(' - ').slice(1).join(' - '),
                                                        image:  item.snippet.thumbnails.default.url,
                                                        duration: 86400,
                                                        format: 1,
                                                        id: 1
                                                });
                                        }
                                });
                        },
                        error: function() {
                                if (errorState === 0) {
                                        getNewLive(callback);
                                        errorState = 1;
                                } else {
                                        API.sendChat('/me [Error] Could not get new live.');
                                }
                        }
                });
        }
        function addMedia(media, callback) {
                $.ajax({
                        url: `/_/playlists/${playlistID}/media/insert`,
                        method: 'POST',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({
                                media: [media],
                                append: false
                        }),
                        success: function() {
                                errorState = 0;


                                callback();
                        },
                        error: function() {
                                if (errorState === 0) {
                                        addMedia(media, callback);
                                        errorState = 1;
                                } else {
                                        API.sendChat('/me [Error] Could not add live.');
                                }
                        }
                });
        }


        function extend() {
                if (!window.bot) return setTimeout(extend, 1000);


                var bot = window.bot;
                bot.retrieveSettings();


                function playLive() {
                        if (API.getDJ() !== undefined || API.getWaitList().length !== 0 || !bot.settings.playLive) return;


                        let liveWarn = ' Join the waitlist and I\'ll stop playing!';
                        let _welcome = bot.chat.welcome;
                        let _welcomeback = bot.chat.welcomeback;
                        let _ss = bot.settings.smartSkip;
                        let _hs = bot.settings.smartSkip;
                        let _tg = bot.settings.smartSkip;


                        bot.settings.smartSkip = false;
                        bot.settings.historySkip = false;
                        bot.settings.timeGuard = false;
                        bot.chat.welcome += liveWarn;
                        bot.chat.welcomeback += liveWarn;
                        if (API.djJoin() === 0) {
                                // only listen to updates once the bot has joined the booth
                                API.once(API.WAIT_LIST_UPDATE, () => {
                                        API.once(API.WAIT_LIST_UPDATE, () => {
                                                bot.settings.smartSkip = _ss;
                                                bot.settings.historySkip = _hs;
                                                bot.settings.timeGuard = _tg;
                                                bot.chat.welcome = _welcome;
                                                bot.chat.welcomeback = _welcomeback;
                                                $.ajax({url:'/_/booth',type:'DELETE'});
                                        });
                                });
                        }
                }
                function skip() {
                        if (API.getWaitList().length === 0) API.moderateForceQuit();
                        else if (bot.settings.smartSkip) bot.roomUtilities.smartSkip();
                        else API.moderateForceSkip();
                }

                bot.commands.toggleSongFilter = {
                        command: ['songFilter', 'toggleSongFilter'],
                        rank: 'host',
                        type: 'exact',
                        functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!bot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                        bot.settings.filterSongs = !bot.settings.filterSongs;


                                        API.sendChat(`/me [@${chat.un}] Song filtering ${(bot.settings.filterSongs ? 'enabled' : 'disabled')}!`);
                                }
                        }
                };

                bot.commands.toggleLivePlay = {
                        command: ['live', 'toggleLive'],
                        rank: 'host',
                        type: 'exact',
                        functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!bot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                        bot.settings.playLive = !bot.settings.playLive;


                                        API.sendChat(`/me [@${chat.un}] Live play ${(bot.settings.playLive ? 'enabled' : 'disabled')}!`);
                                }
                        }
                };

              
                // Remove basicBot advance handler
                API._events.advance.shift();
                // To use our own
                API.on(API.ADVANCE, function(obj) {
                        // Clear timers
                        if (typeof bot.room.historySkip !== 'undefined') clearTimeout(bot.room.historySkip);
                        if (typeof bot.room.autoskipTimer !== 'undefined') clearTimeout(bot.room.autoskipTimer);
                        // Check if a song is playing and woot
                        if (typeof obj.media === 'undefined') return;
                        if (bot.settings.autowoot) $('.btn-like').click();


                        for (var i = 0; i < bot.room.users.length; i++) {
                                if (bot.room.users[i].id === obj.dj.id) {
                                        bot.room.users[i].lastDC = {
                                                time: null,
                                                position: null,
                                                songCount: 0
                                        };
                                }
                        }


                        if (bot.settings.filterSongs) {
                                let blacklistRE = /(justin bieber|ear rape|gemidão do zap)/gi;
                                var blacklistArray = ['nightcore', 'ear rape', 'gemidão do zap'];
                                let wholeTitle = `${obj.media.author} - ${obj.media.title}`.toLowerCase();


                                wholeTitle.split(blacklistRE).forEach((word) => {
                                        let indexOfBlacklist = blacklistArray.indexOf(word);
                                        if (indexOfBlacklist > -1) {
                                                switch(indexOfBlacklist) {
                                                        case 0:
                                                                API.sendChat(`/me [@${obj.dj.username}] Justin Bieber isn't allowed in this room .`);
                                                                bot.roomUtilities.smartSkip();
                                                        break;


                                                        case 1:
                                                        case 2:
                                                                API.sendChat(`/me [@${obj.dj.username}] Good luck playing that again. @staff`);
                                                                if (obj.dj.role > 0 || obj.dj.gRole > 0)
                                                                        waitlistBan({ID: obj.dj.id, duration: 'd', reason: 3});
                                                                else
                                                                        waitlistBan({ID: obj.dj.id, duration: 'f', reason: 3});
                                                        break;
                                                }


                                                return;
                                        }
                                });
                        }


                        var newMedia = obj.media;
                        var format = obj.media.format;
                        var cid = obj.media.cid;
                        setTimeout(function() {
                                var mid = obj.media.format + ':' + obj.media.cid;
                                for (var bl in bot.room.blacklists) {
                                        if (bot.settings.blacklistEnabled) {
                                                if (bot.room.blacklists[bl].indexOf(mid) > -1) {
                                                        API.sendChat(subChat(bot.chat.isblacklisted, {
                                                                blacklist: bl
                                                        }));
                                                        if (bot.settings.smartSkip) {
                                                                return bot.roomUtilities.smartSkip();
                                                        } else {
                                                                return API.moderateForceSkip();
                                                        }
                                                }
                                        }
                                }
                        }, 2000);


                        if (bot.settings.historySkip) {
                                var alreadyPlayed = false;
                                var apihistory = API.getHistory();
                                var dj = obj.dj;
                                var warns = 0;


                                bot.room.historySkip = setTimeout(function() {
                                        for (var i = 0; i < apihistory.length; i++) {
                                                if (apihistory[i].media.cid === obj.media.cid) {
                                                        alreadyPlayed = true;
                                                        warns++;


                                                        if (bot.room.historyList[i])
                                                                bot.room.historyList[i].push(+new Date());
                                                }
                                        }


                                        if (alreadyPlayed) {
                                                if (warns === 0) {
                                                        API.sendChat(subChat(bot.chat.songknown, {
                                                                name: dj.username
                                                        }));
                                                        skip();
                                                } else if (warns === 1) {
                                                        API.sendChat(`/me @${dj.username}, essa m\u00fasica est\u00e1 no hist\u00f3rico.`);
                                                        skip();
                                                } else if (warns === 2) {
                                                        API.sendChat(`/me @${dj.username}, Essa música está no histórico (2º aviso). Por favor verifique sua playlist ou será removido da lista de espera.`);
                                                        skip();
                                                } else if (warns === 3) {
                                                        API.moderateForceQuit();
                                                        API.sendChat(`/me @${dj.username} Você foi removido da lista de espera por ter muitas músicas no histórico (3º aviso). Se isso acontecer mais uma vez, você será banido por 15 minutos.`);
                                                } else if (warns >= 4) {
                                                        waitlistBan({
                                                                ID: dj.id,
                                                                duration: 's',
                                                                reason: 4
                                                        });
                                                        API.sendChat(`/me @${dj.username} Você foi banido por 15 minutos, por favor desabilite auto-join e verifique suas playlists regularmente para evitar que isso aconteça novamente.`);
                                                }
                                        } else {
                                                bot.room.historyList.push([obj.media.cid, +new Date()]);
                                        }
                                }, 2000);
                        }
                });
                API.on(API.CHAT, function(msg) {
                        // trying to be low on ram
                        if (API.getUser().id === 5285179) API.sendChat('/clear');


                        // Auto-delete socket app promotion
                        if (
                                msg.message.indexOf('http://socket.dj') !== -1 &&
                                API.hasPermission(null, API.ROLE.BOUNCER)
                        ) {
                                API.moderateDeleteChat(msg.cid);
                        } else if (
                                roomRE.test(msg.message) &&
                                !API.hasPermission(msg.uid, API.ROLE.BOUNCER)
                        ) {
                                API.moderateDeleteChat(msg.cid);
                                API.sendChat(`/me [@${msg.un}] You are not allowed to post other room links.`);
                        }
                        if (msg.type === 'log' || msg.type === 'emote') return;
                        if (typeof hangMessaged != 'undefined' && msg.uid === API.getUser().id) hangMessaged.push(msg.cid);


                        msg.message = msg.message.toLowerCase();
                        
						if (typeof secret != 'undefined') {
							if (msg.message.length === 1 && penduActive && abc.indexOf(msg.message) !== -1) {
									if (secret.indexOf(msg.message) !== -1 && guessed.indexOf(msg.message) === -1) {
											guessed.push(msg.message);
											for (var i = 0; i < secret.length; i++) {
													if (secret.charAt(i) === msg.message) {
															underline = underline.replaceAt(i, msg.message);
													}
											}


											if (underline.indexOf('_') !== -1)
													API.sendChat(`${underline} ${guess} guesses left!  ${guessed.join(',')}`);
											else {
													API.sendChat(`/me @${msg.un} You found the secret word "${secret}"! :clap:`);
													resetPendu();
											}
									} else if (guessed.indexOf(msg.message) !== -1) {
											API.sendChat(`This letter has already been guessed! ${underline} ${guess} guesses left!  ${guessed.join(',')}`);
									} else {
											guess--;
											guessed.push(msg.message);


											if (guess !== 0)
													API.sendChat(`${underline} ${guess} guesses left! ${guessed.join(',')}`);
											else {
													API.sendChat(`0 guesses left! Nobody found the secret word "${secret}" :disappointed:`);
													resetPendu();
											}
									}


									API.moderateDeleteChat(msg.cid);
							} else if (msg.message.length === secret.length && penduActive && msg.message.indexOf(bot.settings.commandLiteral) !== 0) {
									if (msg.message.toLowerCase() !== secret)
											API.sendChat(`${msg.message} is not the searched word! Try again!`);
									else {
											API.sendChat(`/me @${msg.un} Que sorte! Voce encontrou a palavra "${secret}"  e ganhou 2kpp.! :clap:`);
											resetPendu();
									}
							}
						}
                });
                API.on(API.CHAT_COMMAND, function(cmd) {
                        if (cmd == '/exportchat') {
                                var logs = JSON.parse(localStorage.getItem('basicBotRoom'));
                                logs = logs.chatMessages;


                                var log = '';
                                for (var i=0; i<logs.length; i++) {
                                  log += '['+logs[i].join('] [')+']\n';
                                }


                                var dl = document.createElement('a');
                                dl.href = 'data:attachment/text,' + encodeURI(log);
                                dl.target = '_blank';
                                dl.download = 'log.txt';
                                dl.click();
                  }
                });
                // API.on(API.USER_JOIN, () => toggleCycle());
                // API.on(API.USER_LEAVE, () => toggleCycle());
                API.on(API.WAIT_LIST_UPDATE, () => {
                        if (typeof window.wluInt !== 'undefined') clearTimeout(window.wluInt);
                        if (API.getDJ() !== undefined || API.getWaitList().length !== 0) return;


                        window.wluInt = setTimeout(() => {
                                if (API.getDJ() !== undefined || API.getWaitList().length !== 0) return;


                                getCurrentLive((media) => {
                                        isUnavailable(media, (unavailable, media) => {
                                                if (!unavailable) playLive();
                                                else {
                                                        deleteMedia(media, () => {
                                                                getNewLive((newMedia) => {
                                                                        addMedia(newMedia, () => {
                                                                                playLive();
                                                                        });
                                                                });
                                                        });
                                                }
                                        });
                                });
                        }, 2*60*1000);
                });


            bot.loadChat();
    }


    //Change the bots default settings and make sure they are loaded on launch

    localStorage.setItem("basicBotsettings", JSON.stringify({
      botName: "BlexBOT",
      language: "portuguese",
      chatLink: "https://code.niceatc.dev/@/lang.php",
      scriptLink: "https://code.niceatc.dev/@/bot.php",
      roomLock: false, // Requires an extension to re-load the script
      playLive: true,
      startupCap: 1, // 1-200
      startupVolume: 0, // 0-100
      startupEmoji: false, // true or false
      autowoot: true,
      autoskip: true,
      smartSkip: true,
      cmdDeletion: true,
      maximumAfk: 120,
      afkRemoval: false,
      maximumDc: 60,
      bouncerPlus: true,
      blacklistEnabled: true,
      lockdownEnabled: false,
      lockGuard: false,
      maximumLocktime: 10,
      cycleGuard: true,
      maximumCycletime: 10,
      voteSkip: false,
      voteSkipLimit: 10,
      historySkip: true,
      filterSongs: true,
      timeGuard: true,
      maximumSongLength: 7,
      autodisable: false,
      commandCooldown: 1,
      usercommandsEnabled: true,
      skipPosition: 1,
      skipReasons: [
          ['theme', 'This song does not fit the room theme. '],
          ['op', 'This song is on the OP list. '],
          ['history', 'This song is in the history. '],
          ['mix', 'You played a mix, which is against the rules. '],
          ['sound', 'The song you played had bad sound quality or no sound. '],
          ['nsfw', 'The song you contained was NSFW (image or sound). '],
          ['unavailable', 'The song you played was not available for some users. '],
		  ['ind', 'A música não estava disponivel para alguns usuários.'],
          ['alerta', 'Alerta! Video/musica possui conteúdo inapropriado. Não é permitido! ']
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
      rulesLink: 'https://blex.ml/regras.html',
      themeLink: 'Livre',
      fbLink: null,
      youtubeLink: null,
      website: 'https://blex.ml',
      discordLink: "https://discord.gg/eD3zbyr",
      intervalMessages: [],
      messageInterval: 2,
      songstats: false,
      commandLiteral: '!',
      blacklists: {
        NSFW: '',
        OP: '',
        PREMIADAS: '',
        BANNED: ''
    }
      
    }));

    // Start the bot and extend it when it has loaded.
    $.getScript("https://code.niceatc.dev/@/bot.php", extend);
    //$.getScript("https://moveitbrasil.tk/dl/", extend);

}).call(this);
