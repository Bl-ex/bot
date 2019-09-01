if (sweetbot) sweetbot.shutdown();
var sweetbot = {
    admins: [4378851, 3926149],
    lotWinner: null,
    bolao: 0,
    settings: {
        a: {
            autoJoin: false,
            autoWoot: true,
            bolao: false,
            bouncerLock: false,
            forceWoot: false,
            afkRemoval: false,
            afkLimit: 120,
            lottery: true,
            userCmdCD: 0,
            userCmds: true,
            gettingMehs: false,
            mehlimit: 6,
            duelDelay: 120,
            slotDelay: 900,
            chatFilter: true
        },
        b: {
            spamAtt: false,
            apoc: false,
            autoSkip: false,
            video: true,
            removedFilter: true,
        }
    },
    version: "1.5",
    stats: {
        launchTime: Date.now(),
        woots: 0,
        mehs: 0,
        grabs: 0,
        afk: 0,
        lot: 0,
        songCounter: 0,
        lengths: [3],
    },
    vars: {
        skipping: false,
        globCounter: 0,
        cycleWasFalse: null,
        lotWinner: null,
        bolao: [],
        lotWinners: [],
        nextDJ: API.getWaitList()[0],
        lastChat: Date.now(),
		lastLotteryWinner: 0,
        duel: [],
        duelReady: true,
        muteVotes: 0,
        muteVoters: [],
        voteMute: false,
        voteMuter: null,
        execute: [],
        autoReply: 'off',
        capsLimit: 50,
        chatHistory: [],
        ccl: 0,
        slotReady: true,
        },
    timeouts: {
        spamAlert: undefined,
        bouncerLock: undefined,
        globCounter: undefined,
        skip: undefined,
        lotSelect: undefined,
        userCmds: undefined,
        autoSkip: undefined,
        cmdCD: undefined,
        dcCheck: undefined
    },
    timeoutCalls: {
        spamAlert: function () {
            if (sweetbot.settings.b.spamAtt) sweetbot.timeouts.spamAlert = setInterval(function () {
                sweetbot.sendMsg("Proteção contra SPAM ativada!")
            }, 3e4);
            else clearInterval(sweetbot.timeouts.spamAlert)
        },
        globCounter: function () {
            sweetbot.timeouts.globCounter = setInterval(function () {
                sweetbot.vars.globCounter++;
                if (!(sweetbot.vars.globCounter % 60) && sweetbot.settings.a.lottery && Date.now() - sweetbot.stats.launchTime >= 1e3 * 60 * 20) sweetbot.boostLottery()
            }, 6e4)
        },
        dcCheck: function () {
            sweetbot.timeouts.dcCheck = setInterval(function () {
                if (Date.now() - sweetbot.vars.lastChat >= 1e3 * 60 * 10) sweetbot.shutdown()
            }, 6e4)
        }
    },
    ctx: {
        room : null,
        wl : null
    },
    userData: {},
    waitList: [],
    addToWL: [],
    userCmds: ["dc", "theme","blacklist","help", "rules", "emoji", "commands", "eta", "site", "ping", "oki", "song", "link"],
    sock: undefined,
    onchat: function(a) { 
        sweetbot.eventChat({ message: stripLink(a.message), un: a.un, uid: a.uid, timestamp: a.timestamp, cid: a.cid, type: a.type }) 
    },
    startup: function () {
        if(API.getUser().role >= 3000) {
        this.proxy = {
            eventJoin: $.proxy(this.eventJoin, this),
            eventLeave: $.proxy(this.eventLeave, this),
            eventDjAdv: $.proxy(this.eventDjAdv, this),
            eventCommand: $.proxy(this.eventCommand, this),
            eventDjUpdate: $.proxy(this.eventDjUpdate, this),
            eventVoteUpdate: $.proxy(this.eventVoteUpdate, this),
            eventWaitlistUpdate: $.proxy(this.eventWaitlistUpdate, this)
        };
        API.djJoin = function () {
            $.ajax({
                url: "https://plug.dj/_/booth",
                type: "POST"
            })
        };
        this.getModules();
         
        API.getRoomInfo = function(type) {
            switch (type.toLowerCase()) {
                case 'title':
                    return sweetbot.ctx.room.attributes.name;                   
                case 'welcome':
                    return sweetbot.ctx.room.attributes.welcome;                   
                case 'description':
                    return sweetbot.ctx.room.attributes.description;
                case 'host':
                    return sweetbot.ctx.room.attributes.hostName;
                case 'locked':
                    return sweetbot.ctx.wl.attributes.isLocked;
                case 'cycle':
                    return sweetbot.ctx.wl.attributes.shouldCycle;
                default:
                    return console.error('Invalid Room Info Type Specified!');
            }
        };
        API.on(API.CHAT, this.onchat, this);
        API.on(API.USER_JOIN, this.proxy.eventJoin);
        API.on(API.ADVANCE, this.proxy.eventDjUpdate);
        API.on(API.ADVANCE, this.proxy.eventDjAdv);
        API.on(API.USER_LEAVE, this.proxy.eventLeave);
        API.on(API.VOTE_UPDATE, this.proxy.eventVoteUpdate);
        API.on(API.CHAT_COMMAND, this.proxy.eventCommand);
        API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistUpdate);
        this.vars.globCounter = (new Date).getMinutes();
        var e = JSON.parse(localStorage.getItem("sweetbotData")),
         t = JSON.parse(localStorage.getItem("sweetbotSettings")),
         n = API.getUsers(),
         r, i;      
        if (e) {
            this.stats = e.stats;
            this.userData = e.users;
            this.arrays = e.arrays;
        }
        if (t) this.settings.a = t.settings;
        else localStorage.removeItem("sweetbotSettings");
        for (r in this.userData) {
            var s = false;
            for (i in n) {
                if (r == n[i].id) {
                    s = true;
                    break
                }
            }
            this.userData[r].inRoom = s
        }
        this.timeoutCalls.globCounter();
        for (r in n) if (!this.userData[n[r].id]) this.newUser(n[r].id);
        this.refreshWL();
         
        } else API.chatLog('Only Manager+ have permission to Active the Bot!');
    },
    historyCheck: function(data) {
        return string.replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&#34;/g, "\"").replace(/&#59;/g, ";").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    },
    shutdown: function () {
        API.off(API.CHAT, this.onchat);
        API.off(API.USER_JOIN, this.proxy.eventJoin);
        API.off(API.ADVANCE, this.proxy.eventDjAdv);
        API.off(API.USER_LEAVE, this.proxy.eventLeave);
        API.off(API.VOTE_UPDATE, this.proxy.eventVoteUpdate);
        API.off(API.CHAT_COMMAND, this.proxy.eventCommand);
        API.off(API.ADVANCE, this.proxy.eventDjUpdate);
        API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistUpdate);
        for (var e in this.timeouts) {
            clearTimeout(this.timeouts[e]);
            clearInterval(this.timeouts[e])
        }
        console.log("Snake Mordomo " + this.version + " shut down.");
        sweetbot = false
    },
    eventChat: function (e) {
        if (!e.uid) return;
        sweetbot.vars.chatHistory.push(e);
        if(sweetbot.vars.chatHistory.length > 512) sweetbot.vars.chatHistory.shift();
        if (this.settings.b.apoc) API.moderateDeleteChat(e.cid);
        e.message = this.stringFix(e.message);
        if (e.uid != API.getUser().id) this.vars.lastChat = Date.now();
        if (!this.userData[e.uid]) this.newUser(e.uid);
        this.userData[e.uid].chatted = true;
        if (e.message.indexOf('[AR]') === -1 && e.message.indexOf('[AFK]') === -1) this.userData[e.uid].afk.time = Date.now();
        this.userData[e.uid].afk.warn1 = 0, this.userData[e.uid].afk.warn2 = false;
        if (sweetbot.settings.a.chatFilter) this.messageDeletion(e, e.cid, API.getUser(e.uid).role);
        for (var i in this.arrays.spam) {
            if (e.message.toLowerCase().indexOf(this.arrays.spam[i]) > -1 && API.getUser(e.uid).role === 0 && sweetbot.settings.a.chatFilter) API.moderateDeleteChat(e.cid);
        }
        if (!e.message.indexOf("!")) this.commandHandler(e);
        if (this.userData[e.uid].inbox.msg.length) {
            API.sendChat("@" + e.un + " [Msg from " + this.userData[e.uid].inbox.un + "] " + this.userData[e.uid].inbox.msg);
            this.userData[e.uid].inbox.msg = "";
            this.userData[e.uid].inbox.un = ""
        }
        if (sweetbot.vars.execute.indexOf(e.uid) > -1) {
			API.sendChat('@' + e.un + ' e morreu... :morreu:'); 
			API.moderateBanUser(e.uid, 0, -1)
			delete sweetbot.vars.execute[sweetbot.vars.execute.indexOf(e.uid)];
			setTimeout(function(){
				API.moderateUnbanUser(e.uid);
			},1000);
		}
        if (e.type === 'mention' && sweetbot.vars.autoReply !== 'off') API.sendChat('[AR] @' + e.un + ' ' + sweetbot.vars.autoReply);
		
		var b = e.message.match(/[A-Z]/g);
        if (e.message.length > 100 && b && b.length > 40) {
            API.moderateDeleteChat(e.cid);
            setTimeout(function(){
                API.moderateMuteUser(e.uid, 0, API.MUTE.LONG);
            }, 2000);
        }
    },
    eventCommand: function (e) {
		switch (e.split(' ')[0]) {
        case "/autojoin":
            this.settings.a.autoJoin = !this.settings.a.autoJoin;
            API.chatLog(this.settings.a.autoJoin ? "Autojoin enabled" : "Autojoin disabled", true);
            break;
        case "/autowoot":
            this.settings.a.autoWoot = !this.settings.a.autoWoot;
            API.chatLog(this.settings.a.autoWoot ? "Autowoot enabled" : "Autowoot disabled", true);
            break;
        case "/lock":
            API.moderateLockWaitList(true);
            break;
        case "/unlock":
            API.moderateLockWaitList(false);
            break;
        case "/getmehs":
            this.getMehs();
            if (e.split(' ')[1] === 'enable') {
                this.settings.a.gettingMehs = true;
                API.chatLog('Getmehs enabled', true);
            } else if (e.split(' ')[1] === 'disable') {
                this.settings.a.gettingMehs = false;
                API.chatLog('Getmehs disabled', true);
            }
            break;
        case "/video":
            this.settings.b.video = !this.settings.b.video;
            $("#yt-frame").slideToggle();
            $(".background").slideToggle();
            API.chatLog("Toggled video", true);
            break;
        case '/fixmotd':
            var a = JSON.parse(localStorage.getItem('sweetbotData'));
            delete a.arrays.motd;
            localStorage.setItem('sweetbotData', JSON.stringify(a));
            break;
        case '/autoreply':
            sweetbot.vars.autoReply = e.substr(11);
            API.chatLog('AutoReply is now "' + e.substr(11) + '"', true);
            break;
        }
    },
    eventDjAdv: function (e) {
        var woots = e.lastPlay.score.positive,
            grabs = e.lastPlay.score.grabs + e.lastPlay.score.grabs + e.lastPlay.score.grabs,
            mehs  = e.lastPlay.score.negative;

        var earned = woots + grabs;

        sweetbot.userData[e.lastPlay.dj.id].pts = sweetbot.userData[e.lastPlay.dj.id].pts + earned;        

        for (var i in API.getUsers()){
            sweetbot.userData[API.getUsers()[i].id].lastWoot++;
        };
    },
    eventJoin: function (e) {
        if (!this.userData[e.id]) this.newUser(e.id);
        this.userData[e.id].inRoom = true;
        this.userData[e.id].chatted = false;
        this.userData[e.id].joinTime = Date.now()
    },
    eventLeave: function (e) {
        if (!this.userData[e.id]) this.newUser(e.id);
        this.userData[e.id].inRoom = false, this.userData[e.id].afk.warn1 = 0, this.userData[e.id].afk.warn2 = false;
        if (this.waitList.indexOf(e.id) > -1) {
            this.refreshWL()
            this.userData[e.id].leaveTime = new Date().toString().split(' ')[4];
        }
        for (var t in this.addToWL) {
            if (this.addToWL[t].id == e.id) this.addToWL.splice(t, 1);
            break
        }
    },
    eventVoteUpdate: function (e) {
        if (!this.userData[e.user.id]) this.newUser(e.user.id);
        if (this.userData[e.user.id].vote == 1)--this.userData[e.user.id].woots;
        else if (this.userData[e.user.id].vote == -1)--this.userData[e.user.id].mehs;
        if (e.vote == 1) ++this.userData[e.user.id].woots;
        else if (e.vote == -1){
            ++this.userData[e.user.id].mehs;
            if (this.settings.a.gettingMehs) sweetbot.getMehs();
        }
        if (e.vote == 1) ++this.userData[e.user.id].pts;
        this.userData[e.user.id].vote = e.vote
        var MTS = API.getScore().negative - API.getScore().grabs;
        if (MTS >= sweetbot.settings.a.mehlimit) {
            API.sendChat('@' + API.getDJ().username + ' Sua musica recebeu muitos chatos');
            API.moderateForceSkip();
        }
        if (e.vote === 1) sweetbot.userData[e.user.id].lastWoot = 0;
    },
    eventDjUpdate: function (e) {
        setTimeout(function(){$("#woot").click()}, 1000);
        if (this.settings.a.autoJoin && API.getWaitListPosition() == -1 && !this.getLocked()) API.djJoin();
        this.refreshWL();
        this.vars.nextDJ = API.getWaitList()[0]
        if (this.settings.a.forceWoot) this.forceWoot();
    },
    eventWaitlistUpdate: function (e) {
        if (this.settings.a.autoJoin && API.getWaitListPosition() == -1 && !this.getLocked()) API.djJoin();
    },
    commandHandler: function (e) {
        var t = e.message.substr(1).split(" ");
        if (!this.vars.cmdOnCD && this.commands[t[0]]) {
            var n = API.getUser(e.uid).role;
            if (API.getUser(e.uid).gRole > 0) n = 6000;
            if (sweetbot.admins.indexOf(e.uid) > -1) n = 6000;
            if (n == 0 && this.settings.a.userCmds && !this.vars.userCmdOnCD && this.userCmds.indexOf(t[0]) > -1) n = 1;
            else if (n == 2 && this.settings.a.bouncerLock && this.bouncerPlus.indexOf(t[0]) > -1) n = 3;
              
            if (n >= this.commands[t[0]].r) {
                this.vars.cmdOnCD = true;
                this.timeouts.cmdCD = setTimeout(function () {
                    sweetbot.vars.cmdOnCD = false
                }, 2e3);
                this.commands[t[0]].f(t, e);
                if (API.getUser(e.uid).role == 0 && t[0] != "lottery") {
                    this.vars.userCmdOnCD = true;
                    var r = this.settings.a.userCmdCD * 1e3;
                    this.timeouts.userCmds = setTimeout(function () {
                        sweetbot.vars.userCmdOnCD = false
                    }, r)
                }
            } else if (!e.message.indexOf("/")) this.sock.emit("cmderror", "You haven't the necessary rank!")
        } else if (!e.message.indexOf("/")) {
            if (this.vars.cmdOnCD) this.sock.emit("cmderror", "Commands on cooldown");
            else this.sock.emit("cmderror", "Not a valid command")
        }
    },
    commands: {
        apocalypse: {
            f: function (e, t) {
                sweetbot.settings.b.apoc = !sweetbot.settings.b.apoc;
                if (sweetbot.settings.b.apoc) {
                    sweetbot.sendMsg("[@" + t.un + "] Chamou o Apocalypse!");
                    setTimeout(function(){
                            sweetbot.settings.b.apoc = true;
                        }, 2000);
                    var n = $("#chat-messages").children();
                    for (var r = 0; r < n.length; r++) API.moderateDeleteChat(n[r].className.substr(n[r].className.indexOf("cid-") + 4, 14))
                } else setTimeout(function () {
                    sweetbot.sendMsg("[@" + t.un + "] Encerrou o apocalypse!")
                }, 1e3)
            },
            r: 3000
        },
        settings: {
            f: function (e, t) {
                var n = "Removedor de AFK: ";
                n += sweetbot.settings.a.afkRemoval ? "Ativado | " : "Desativado | ";
                n += "Loteria: ";
                n += sweetbot.settings.a.lottery ? "Ativado | " : "Desativado | ";
                n += "ForceWoot: ";
                n += sweetbot.settings.a.forceWoot ? "Ativado | " : "Desativado ";
                sweetbot.sendMsg("[" + t.un + "] " + n)
            },
            r: 2000
        },
        forcewoot: {
            f: function (e, t) {
                sweetbot.settings.a.forceWoot = !sweetbot.settings.a.forceWoot;
                if (sweetbot.settings.a.forceWoot) sweetbot.sendMsg("[" + t.un + "] ForceWoot Ativado! Vote enquanto estiver na lista de espera para evitar ser removido!"), sweetbot.forceWoot;
                else sweetbot.sendMsg("[" + t.un + "] ForceWoot AFK Desativado!");
            },
            r: 3000
        },
		slots: {
			f: function(e, t) {
				if(sweetbot.userData[t.uid].slots.ready) {
					var slots = [":bomb:", ":banana:", ":apple:", ":tomato:", ":cherries:", ":watermelon:", ":pineapple:", ":grapes:"];
					
					var random1 = Math.floor((Math.random() * slots.length));
					var random2 = Math.floor((Math.random() * slots.length));
					var random3 = Math.floor((Math.random() * slots.length));

					var slot1 = slots[random1];
					var	slot2 = slots[random2];
					var	slot3 = slots[random3];

					var msg = " Slots: " + slot1 + "/" + slot2 + "/" + slot3 + ".";
					API.sendChat("/em [" + t.un + "]" + msg);
					
					if (slot1 === slot2 && slot1 === slot3) {
						sweetbot.userData[t.uid].pts = sweetbot.userData[t.uid].pts + 5;
					} else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
						sweetbot.userData[t.uid].pts = sweetbot.userData[t.uid].pts + 2;
					}

					setTimeout(function(){	
						sweetbot.userData[t.uid].slots.ready = false;
						setTimeout(function(){
							sweetbot.userData[t.uid].slots.ready = true;
						}, sweetbot.settings.a.slotDelay * 1e3);
					},5e3);
                    sweetbot.saveData();
				} else {
					API.sendChat("/em [" + t.un + "] Você só pode usar o slots uma vez a cada " + (~~(sweetbot.settings.a.slotDelay / 60)) + " minutos!");
				}
			},
			r: 0
		},
		points: {
			f: function(e,t) {
				var points = sweetbot.userData[t.uid].pts;
				API.sendChat("/em [" + t.un + "] Você tem " + points + " Pontos Blex!.");
			},
			r: 0
		}, 
        slotreadyy: {
            f: function(e, t) {
                if (e.length == 1) sweetbot.sendMsg("[" + t.un + "] Modo de usar: !slotready @usuario");
                else {
                    var n = API.getUser(sweetbot.getUserByName(e[1].substr(1)));
                    if (!n) sweetbot.sendMsg("[" + t.un + "] Usuario não encontrado!.");
                    else {
                        sweetbot.userData[n.id].slots.ready = true;
                        API.sendChat("[" + t.un + "] Timer de slot de "+ n.id +" " + n.username + " Corrigido.")
                    }
                }
            },
            r:2000
        },
        fan: {
            f: function(e, t) {
                if (e.length == 1) sweetbot.sendMsg("[" + t.un + "] Modo de usar: !fan @usuario");
                else {
                    var n = API.getUser(sweetbot.getUserByName(e[1].substr(1)));
                    if (!n) sweetbot.sendMsg("[" + t.un + "] Usuario não encontrado!.");
                    else {
                        if(n.id == t.uid) sweetbot.sendMsg("[" + t.un + "] Você não pode ser fan de si mesmo")
                        else {
                            if(sweetbot.userData[n.id].fans.indexOf(t.uid) > -1) sweetbot.sendMsg("[" + t.un + "] Você já é fan deste usuário.");
                            else {
                                sweetbot.userData[n.id].fans.push(t.uid);
                                API.sendChat("@" + n.username + ", " + t.un + " Agora é seu fan!")
                            }
                        }
                    }
                }
            },
            r: 0
        },
        unfan: {
            f: function(e, t) {
                if (e.length == 1) sweetbot.sendMsg("[" + t.un + "] Modo de usar: !unfan @usuario");
                else {
                    var n = API.getUser(sweetbot.getUserByName(e[1].substr(1)));
                    if (!n) sweetbot.sendMsg("[" + t.un + "] Usuario não encontrado!.");
                    else {
                        if(sweetbot.userData[n.id].fans.indexOf(t.uid) > -1)  {
                            sweetbot.userData[n.id].fans.splice(t.uid, 1);
                            API.sendChat("@" + n.username + ", " + t.un + " Não é mais seu fan!")
                        } else {
                            sweetbot.sendMsg("[" + t.un + "] Você não é fan desse usuário.");
                        }
                    }
                }
            },
            r: 0
        },
        myfans: {
            f: function(e, t) {
                var fans = sweetbot.userData[t.uid].fans.length;
                sweetbot.sendMsg("[" + t.un + "] Você possui " + fans + " Fans!");
            },
            r: 0
        },
        startbolao: {
            f: function(e, t) {
                sweetbot.settings.a.bolao = true;
                API.sendChat("[ @everyone ] O bolão foi iniciado! envie (!apostar 50) ou mais pontos nos proximos 2 minutos para apostar!");
                setTimeout(function(){
                    var winner = sweetbot.vars.bolao[Math.floor(Math.random() * sweetbot.vars.bolao.length)];
                    var u = API.getUser(winner);
                    API.sendChat("@" + u.username + " venceu o bolão! 🎉 Ganhou o acumulado de " + sweetbot.bolao + " pontos!");
                    sweetbot.userData[u.id].pts = sweetbot.userData[u.id].pts + sweetbot.bolao;
                    sweetbot.settings.a.bolao = false;
                    sweetbot.vars.bolao = [];
                    sweetbot.bolao = 0;
                }, 120000)
            },
            r: 3000
        },
        apostar: {
            f: function(e, t) {
                if(e.length == 1) sweetbot.sendMsg("[" + t.un + "] Digite um valor para aposta");
                else {
                    if (sweetbot.settings.a.bolao) {
                        var valor = parseInt(t.message.substr(9));
                        if (sweetbot.userData[t.uid].pts >= valor && valor >= 50){
                            sweetbot.bolao = sweetbot.bolao + valor;
                            sweetbot.userData[t.uid].pts = sweetbot.userData[t.uid].pts - valor;
                            if (sweetbot.vars.bolao.indexOf(t.uid) > -1) {

                            } else {
                                sweetbot.vars.bolao.push(t.uid);
                            }
                            API.sendChat("@" + t.un + " Apostou " + valor + " Pontos no bolão! Valor total apostado: " + sweetbot.bolao);
                        } else {
                            API.sendChat("@" + t.un + " Você não possui o valor de pontos de sua aposta. Valor Minimo para a aposta: 50 Pontos")
                        }
                    }
                }
            },
            r: 0
        },
		pinga: {
			f: function(e, t){
				var id = t.uid,
				isDj = API.getDJ().id == id ? true : false,
				from = t.un,
				djlist = API.getWaitList(),
				inDjList = false,
				oldTime = 0,
				usedBeats = false,
				indexArrUsedBeats,
				beatsCd = false,
				timeInMinutes = 0,
				worthyAlg = Math.floor(Math.random() * 5) + 1,
				points = sweetbot.userData[t.uid].pts;
				worthy = worthyAlg == 5 ? true : false;
				
				for (var i = 0; i < djlist.length; i++) {
					if (djlist[i].id == id)
						inDjList = true;
				}
				
				if (points >= 500) {
					sweetbot.userData[t.uid].pts = sweetbot.userData[t.uid].pts - 500;
					if (worthy) {
						if (API.getWaitListPosition(id) != 0)
							API.moderateMoveDJ(id, 1, false);
							API.sendChat("@" + from + " Você mostrou que é cabra macho e não arregou pra pinga, por isso você merece uma posição melhor! :beer:");
                    } else {
					if (API.getWaitListPosition(id) != djlist.length - 1)
						API.moderateMoveDJ(id, djlist.length, false);
						API.sendChat("@" + from + " Você não resistiu a pinga e acabou dando PT, volte para o final da fila enquanto toma uma glicose :syringe:");
					}
				} else {
					API.sendChat("@" + from + " Você precisa ter uma quantidade minima de 500 Pontos Blex para comprar uma pinga e encher a cara.")
				}
                sweetbot.saveData();
			},
			r: 0
		},
        buy: {
            f: function(e, t) {
                if (e.length == 1) sweetbot.sendMsg("[" + t.un + "] Modo de usar: !buy número do item");
                else {
                    var r = API.getWaitListPosition(t.uid);
                    var n = parseInt(e[1].substr(e[1].length-2).trim());
                    if(t.uid == API.getDJ().id) sweetbot.sendMsg("[" + t.un + "] Usuario está atualmente tocando, compre após o término! ");
                    else {
                    switch(n) {
                        case 1:
                            if(sweetbot.userData[t.uid].pts >= 2500) {
                                if (r > -1 && r != undefined) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar a posição 1 na lista de espera por 2500 pontos!");
                                    API.moderateMoveDJ(t.uid, n)
                                } else if (API.getWaitList().length < 50) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar a posição 1 na lista de espera por 2500 pontos!");
                                    API.moderateAddDJ(t.uid);
                                    setTimeout(function () {
                                        API.moderateMoveDJ(t.uid, n)
                                    }, 3e3)
                                }
                                sweetbot.saveData();
                                sweetbot.userData[t.uid].pts = sweetbot.userData[t.uid].pts - 2500;
                            } else API.sendChat("@" + t.un + " Você não tem pontos suficientes para comprar essa posição.");
                            break;
                        case 2:
                            if(sweetbot.userData[t.uid].pts >= 2000) {
                                if (r > -1 && r != undefined) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar a posição 2 na lista de espera por 2000 pontos!");
                                    API.moderateMoveDJ(t.uid, n)
                                } else if (API.getWaitList().length < 50) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar a posição 2 na lista de espera por 2000 pontos!");
                                    API.moderateAddDJ(t.uid);
                                    setTimeout(function () {
                                        API.moderateMoveDJ(t.uid, n)
                                    }, 3e3)
                                }
                                sweetbot.saveData();
                                sweetbot.userData[t.uid].pts = sweetbot.userData[t.uid].pts - 2000;
                            } else API.sendChat("@" + t.un + " Você não tem pontos suficientes para comprar essa posição.");
                            break;
                         case 3:
                            if(sweetbot.userData[t.uid].pts >= 1500) {
                                if (r > -1 && r != undefined) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar a posição 3 na lista de espera por 1500 pontos!");
                                    API.moderateMoveDJ(t.uid, n)
                                } else if (API.getWaitList().length < 50) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar a posição 3 na lista de espera por 1500 pontos!");
                                    API.moderateAddDJ(t.uid);
                                    setTimeout(function () {
                                        API.moderateMoveDJ(t.uid, n)
                                    }, 3e3)
                                }
                                sweetbot.saveData();
                                sweetbot.userData[t.uid].pts = sweetbot.userData[t.uid].pts - 1500;
                            } else API.sendChat("@" + t.un + " Você não tem pontos suficientes para comprar essa posição.");
                            break;
                        case 4:
                            if(sweetbot.userData[t.uid].pts >= 1000) {
                                if (r > -1 && r != undefined) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar o cargo de DJ Residente por 1000 pontos! ");
                                    API.moderateSetRole(t.uid, API.ROLE.DJ);
                                } else if (API.getWaitList().length < 50) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar o cargo de DJ Residente por 1000 pontos! ");
                                    API.moderateSetRole(t.uid, API.ROLE.DJ);
                                }
                                sweetbot.saveData();
                                sweetbot.userData[t.uid].pts = sweetbot.userData[t.uid].pts - 1000;
                            } else API.sendChat("@" + t.un + " Você não tem pontos suficientes para comprar o cargo de DJ.");
                            break;
                        case 5:
                            if(sweetbot.userData[t.uid].pts >= 10000) {
                                if (r > -1 && r != undefined) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar VIP de 1 mês por 10000 pontos! @staff ");
                                } else if (API.getWaitList().length < 50) {
                                    sweetbot.sendMsg(t.un + " Acaba de comprar VIP de 1 mês por 10000 pontos! @staff ");
                                }
                                sweetbot.saveData();
                                sweetbot.userData[t.uid].pts = sweetbot.userData[t.uid].pts - 10000;
                            } else API.sendChat("@" + t.un + " Você não tem pontos suficientes para comprar o VIP.");
                            break;
                            
                        default:
                            API.sendChat("@" + t.un + " Item desejado não está disponivel para compra.")
                    }
                    }
                }
            },
            r: 0
        },
        startlottery: {
            f: function(e, t) {
                sweetbot.sendMsg('[@' + t.un + '] A loteria vai ser sorteada em 5 minutos! esteja ativo no chat para participar!');
                setTimeout(sweetbot.boostLottery, 300000);
            },
            r: 3000
        },
        voteskip: {
            f: function (e, t) {
                if (!isNaN(parseInt(t.message.substring(10))) && t.message.substring(10) !== ' ' && t.message.substring(10) !== undefined) {
                    sweetbot.settings.a.mehlimit = parseInt(t.message.substring(10));
                    sweetbot.sendMsg('[' + t.un + '] Limite do Voteskip é de: ' + sweetbot.settings.a.mehlimit);
                    setTimeout(function(){ if (API.getScore().negative >= sweetbot.settings.a.mehlimit) {API.sendChat('@' + API.getDJ().username + ' Sua musica recebeu muitos chatos!'); API.moderateForceSkip();}}, 1500);
                } else {
                    sweetbot.sendMsg('[' + t.un + '] How to use: !voteskip [mehs of number]');
                }
            },
            r: 3000
        },
        boostlottery: {
            f: function (e, t) {
                sweetbot.settings.a.lottery = !sweetbot.settings.a.lottery;
                if (sweetbot.settings.a.lottery) sweetbot.sendMsg("[" + t.un + "] Bônus da loteria ativo. A cada hora, usuários ativos tem a chance de ganhar a posição 2 na lista de espera");
                else {
                    sweetbot.sendMsg("[" + t.un + "] Loteria Desativada!");
                    clearTimeout(sweetbot.timeouts.lotSelect)
                }
            },
            r: 3000
        },
        lotreset: {
            f: function (e, t) {
                sweetbot.settings.a.globCounter = 0;
                sweetbot.sendMsg("[" + t.un + "]  Loteria resetada. A próxima rodada será nos próximos 60 minutos!")
            },
            r: 3000
        },
        lotsync: {
            f: function (e, t) {
                sweetbot.settings.a.globCounter = (new Date).getMinutes();
                sweetbot.sendMsg("[" + t.un + "] Loteria sincronizada com a hora atual. A loteria ocorrerá a cada hora! (:00)")
            },
            r: 3000
        },
        kick: {
            f: function (e, t) {
                if (e.length == 1) sweetbot.sendMsg("[" + t.un + "] Como usar: !kick @User [Minutes]");
                else if (API.getUser(sweetbot.getUserByName(e[1].substr(1))).role === 0){
                    var n = API.getUser(sweetbot.getUserByName(e[1].substr(1)));
                    if (!n) sweetbot.sendMsg("[" + t.un + "] Usuario não encontrado!");
                    else {
                        var r = parseInt(e[2]) * 1e3 * 60;
                        if (isNaN(r)) sweetbot.sendMsg("[" + t.un + "] Error. (NaN)");
                        else {
                            sweetbot.sendMsg("[" + t.un + " Usou kick]");
                            API.moderateBanUser(n.id, 0);
                            setTimeout(function () {
                                API.moderateUnbanUser(n.id);
                            }, r)
                        }
                    }
                }
            },
            r: 2000
        },
        wlban: {
            f: function (e, t) {
                if (e.length == 1) sweetbot.sendMsg("[" + t.un + "] Como usar: !wlban @User");
                else {
                    var n = API.getUser(sweetbot.getUserByName(e[1].substr(1)));
                    if (!n) sweetbot.sendMsg("[" + t.un + "] Usuario não encontrado!");
                    else {
                        sweetbot.sendMsg("[" + t.un + " Usou wlban]");
                        $.ajax({
                            url: 'https://plug.dj/_/booth/waitlistban',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                'duration': 's',
                                'userID': n.id,
                                'reason': 1
                            })
                        })
                    }
                }
            },
            r: 2000
        },
        wlunban: {
            f: function (e, t) {
                if (e.length == 1) sweetbot.sendMsg("[" + t.un + "] How To Use: !wlban @User");
                else {
                    var n = API.getUser(sweetbot.getUserByName(e[1].substr(1)));
                    if (!n) sweetbot.sendMsg("[" + t.un + "] Usuario não encontrado!");
                    else {
                        sweetbot.sendMsg("[" + t.un + " Usou wlunban]");
                        $.ajax({
                            url: 'https://plug.dj/_/booth/waitlistban/' + n.id,
                            type: 'DELETE'
                        })
                    }
                }
            },
            r: 2000
        },
        capslimit: {
            f: function (e, t) {
                if (!isNaN(parseInt(t.message.substr(11)))) {
                    sweetbot.vars.capsLimit = parseInt(t.message.substr(11));
                    API.sendChat("[" + t.un + "] limite de CapsLock nas palavras mudou para " + sweetbot.vars.capsLimit);
                } else {
                    API.sendChat('[' + t.un + '] Como usar: !capslimit Number ');
                }
            },
            r: 3000
        },
        spamattack: {
            f: function (e, t) {
                sweetbot.settings.b.spamAtt = !sweetbot.settings.b.spamAtt;
                if (sweetbot.settings.b.spamAtt) sweetbot.sendMsg("[" + t.un + "] PROTEÇÃO DE SPAM ATIVO.");
                else sweetbot.sendMsg("[" + t.un + "] PROTEÇÃO DE SPAM DESATIVADO.")
            },
            r: 3000
        },
        spam: {
            f: function (e, t) {
                if (t.message.substring(6)){
                    sweetbot.arrays.spam.push(t.message.substring(6).trim());
                    sweetbot.sendMsg("[" + t.un + "] Adicionado a lista de spam")
                    sweetbot.saveData();
                } else {
                    sweetbot.sendMsg('[' + t.un + '] Você precisa de uma palavra!')
                }
            },
            r: 3000
        },
        removespam: {
            f: function (e, t) {
                if (t.message.substring(12)){
                    sweetbot.arrays.spam.splice(t.message.substring(12).trim());
                    sweetbot.sendMsg("[" + t.un + "] Removido da lista de spam")
                    sweetbot.saveData();
                } else {
                    sweetbot.sendMsg('[' + t.un + '] Você precisa de uma palavra!')
                }
            },
            r: 3000
        },
        lottery: {
            f: function (e, t) {
                if (sweetbot.settings.a.lottery && t.uid == sweetbot.vars.lotWinner) {
                    check = true;
                    for (i in sweetbot.addToWL) if (sweetbot.addToWL[i].id == t.uid) {
                        sweetbot.sendMsg("[" + t.un + "] Você já está sendo adicionado! Um novo vencedor será escolhido em breve!");
                        check = false;
                        break
                    }
                    if (check) {
                        sweetbot.vars.lotWinner = null;
                        clearTimeout(sweetbot.timeouts.lotSelect);
                        sweetbot.vars.lotWinners.length = 0;
                        ++sweetbot.stats.lot;
                        if (API.getWaitListPosition(t.uid) != undefined) {
                            API.moderateMoveDJ(t.uid, 2)
                        } else if (API.getWaitList().length < 50) {
                            API.moderateAddDJ(t.uid);
                            setTimeout(function () {
                                API.moderateMoveDJ(t.uid, 2)
                            }, 1500)
                        } else {
                            API.moderateLockWaitList(true);
                            sweetbot.addToWL.push({
                                id: t.uid,
                                pos: 2
                            });
                            sweetbot.sendMsg("[" + t.un + "] Movendo o vencedor da loteria para a posição 2. Fila: " + sweetbot.addToWL.length)
                        }
                    }
                    sweetbot.lastWinner = t.un;
                }
            },
            r: 0
        },
        lotwinner: {
            f: function(e, t) {
                sweetbot.sendMsg('[' + t.un + '] O ultimo ganhador da loteria foi: @' + sweetbot.lastWinner + ' !');
            },
            r: 2000
        },
        google: {
            f: function(e, t) {
                if (typeof t.message.substring(8) == "undefined") {
                    API.sendChat("["+t.un+"] Por favor, especifique uma consulta!");
                } else {
                    var r = t.message.substring(8);
                    API.sendChat("["+t.un+"] https://google.com/search?q="+escape(r.replace(/ /g,"+")));
                }
            },
            r: 0
        },
        youtube: {
            f: function(e, t) {
                if (typeof t.message.substring(9) == "undefined") {
                    API.sendChat("["+t.un+"] Por favor, especifique uma consulta!");
                } else {
                    var r = t.message.substring(9);
                    API.sendChat("["+t.un+"] https://www.youtube.com/results?search_query="+escape(r.replace(/ /g,"+")));
                }
            },
            r: 0
        },
        votemute: {
            f: function(e, t){
                console.log(sweetbot.getUserByName(t.message.substr(11)));
                console.log(t.message.substr(11));
                if (!sweetbot.vars.voteMute && sweetbot.getUserByName(t.message.substr(11))) {
                    var name = t.message.substr(11), id = sweetbot.getUserByName(name), user = API.getUser(id);
                    console.log(name + ' ' + id);
                    sweetbot.vars.voteMuter = t.uid;
                    sweetbot.vars.voteMute = true;
                    sweetbot.vars.muteVotes++;
                    sweetbot.vars.muteVoters.push(t.uid);
                    API.sendChat(t.un + ' começou um VoteMute contra ' + name.trim() + '! Digite !votemute dentro de 2 minutos para votar, este usuário será mutado por 30 minutos.');
                    var timer = setTimeout(function(){
                        if (Math.round(sweetbot.vars.muteVotes / API.getUsers().length * 100) >= 30) {
                            API.sendChat('VoteMute Win com: (' + sweetbot.vars.muteVotes + ' votos)');
                            API.moderateMuteUser(id, 1, API.MUTE.MEDIUM);
                        } else {
                            API.sendChat('VoteMute teve poucos votos: (' + sweetbot.vars.muteVotes + ' votos), o usuário não será mutado');
                        }
                        sweetbot.vars.voteMute = false;
                        sweetbot.vars.muteVotes = 0;
                        sweetbot.vars.muteVoters = [];
                        sweetbot.vars.voteMuter = t.uid;
                    }, 120000);
                } else if (sweetbot.vars.muteVoters.indexOf(t.uid) === -1 && sweetbot.vars.voteMute) {
                    API.sendChat('[' + t.un + '] Votou!');
                    sweetbot.vars.muteVoters.push(t.uid);
                    sweetbot.vars.muteVotes++;
                } else if (t.message.substr(10) == 'cancel' && (API.getUser(t.uid).role > 2 || sweetbot.admins.indexOf(t.uid) > -1 || t.uid == sweetbot.vars.muteVoter)) {
                    clearTimeout(timer);
                    sweetbot.vars.voteMute = false;
                    sweetbot.vars.muteVotes = 0;
                    sweetbot.vars.muteVoters = [];
                    sweetbot.vars.voteMuter = t.uid;
                    API.sendChat('VoteMute Cancelado');
                } else if (sweetbot.vars.muteVoters.indexOf(t.uid) > -1) {
                    API.sendChat('Voçe já votou!');
                } else {
                    API.sendChat('Usuário invalido');
                }
            },
            r: 0
        },
        execute: {
            f: function(e, t) {
                var name = t.message.substr(10), id = sweetbot.getUserByName(name);
  
                if (id) {
                    sweetbot.vars.execute.push(id);
                    API.sendChat('[' + t.un + '] @' + name + ' Você será executado(a) quais suas ultimas palavras?');
                } else {
                    API.sendChat('[' + t.un + '] Como usar: !execute @user ')
                }
            },
            r: 4000
        },
		run: {
            f: function(e, t) {
                a = sweetbot.cleanString(t.message.substr(5));
                console.log(a);
                b = new Function(a);
                b();
            }, 
			r: 6000
        },
        reset: {
            f: function(e, t){
                var user = API.getUser(sweetbot.getUserByName(t.message.substr(8)));
                API.sendChat("O usuário " + user.username + " Foi resetado com sucesso!");
                sweetbot.userData[user.id].pts = 0;
            },
            r: 6000
        }
    },
    messageDeletion: function (e, t, n) {
        var r = false,
         i, s, o = e.message.toLowerCase();
        if (n < 2) {
            for (i in this.arrays.off) if (o.indexOf(this.arrays.off[i]) > -1) s = "offense";
            if (o.indexOf("http://adf.ly/") > -1) s = "adfly";
            if (o.indexOf("plug.dj/") > -1 && o.indexOf('.plug.dj') === -1) {
                for (i in this.arrays.links) if (o.indexOf(this.arrays.links[i]) > -1) r = true;
                if (!r) s = "roomlink"
            }
            if (e.message == e.message.toUpperCase() && e.message.length > sweetbot.vars.capsLimit) s = "caps";
            if (s) {
                API.moderateDeleteChat(t);
                if (s == "adfly") API.sendChat("@" + e.un + " Por favor, altere seu programa de autowoot! Esse tem vírus! ");
                else if (s == "roomlink") API.sendChat("@" + e.un + " Por favor, não compartilhe salas aqui ");
                else if (s == "caps") API.sendChat("@" + e.un + " Deslige seu CapsLock :rage: | Turn Off your CapsLock :rage:")
            }
        }
    },
	cleanString: function(string) {
        return string.replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&#34;/g, "\"").replace(/&#59;/g, ";").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    },
    boostLottery: function () {
        var e = API.getUsers(),
         t = e.length,
         n = API.getHistory(),
         r, i;
        for (i in e) if (!sweetbot.userData[e[i].id]) sweetbot.newUser(e[i].id);
        while (t--) {
            if (e[t].id == API.getUser().id) e.splice(t, 1);
            else if (Date.now() - sweetbot.userData[e[t].id].joinTime < 1e3 * 60 * 10) e.splice(t, 1);
            else if (Date.now() - sweetbot.userData[e[t].id].afk.time > 1e3 * 60 * 15 || !sweetbot.userData[e[t].id].chatted) e.splice(t, 1);
            else if (API.getWaitListPosition(e[t].id) < 3 || API.getDJ().id == e[t].id) e.splice(t, 1);
            else for (i = 0; i < 10; i++) {
                if (n[i].user.id == e[t].id) {
                    //e.splice(t, 1);
                    break
                }
            }
        }
        t = e.length;
		
		var c = 0;
		
		do {			
			r = e[Math.floor(Math.random() * t)];
			c++;
		} while (e.length > 1 && sweetbot.vars.lastLotteryWinner == r.id && c < 100 /* vai que dá merda nesse código legado, né */);
		
		sweetbot.vars.lastLotteryWinner = r.id;
		
        if (r) {
            sweetbot.vars.lotWinners.push(r.id);
            sweetbot.vars.lotWinner = r.id;
            sweetbot.timeouts.lotSelect = setTimeout(sweetbot.boostLottery, 1e3 * 120);
            API.sendChat("@" + r.username + ' Você ganhou a loteria! Antes de dois minutos, digite !lottery para ser movido para a posição 2. Se não, irei escolher outro usuário.');
        } else sweetbot.sendMsg("Infelizmente, ninguém é qualificado a ganhar a loteria! (Ou algo ruim aconteceu!) Será escolhido um novo vencedor, então esteja ativo no bate-papo!")
    },
    newUser: function (e) {
        this.userData[e] = {
            woots: 0,
            mehs: 0,
            vote: 0,
            pts: 0,
            afkMessage: '',
            afkCooldown: true,
            lastWoot: 0,
            fans: [],
            warns: {
                forceWoot: false
            },
            afk: {
                time: Date.now(),
                warn1: 0,
                warn2: false
            },
			slots: {
				ready: true
			},
            chatted: false,
            joinTime: Date.now(),
            leaveTime: null,
            inRoom: true,
            inbox: {
                msg: "",
                from: ""
            }
        }
    },
    getUserByName: function(name){
        for(var i in API.getUsers()) {
            if (API.getUsers()[i].username === name.trim()) return API.getUsers()[i].id;
        }
    },
    refreshWL: function () {
        var e = API.getWaitList(),
         t;
        this.waitList = [];
        for (t in e) this.waitList.push(e[t].id);
        if (this.waitList.length > 50) this.waitList.pop()
    },
    saveData: function () {
        var e = {
            arrays: this.arrays,
            stats: this.stats,
            users: this.userData,
            b: Date.now()
        },
         t = {
            settings: this.settings.a
         };

        localStorage.setItem("sweetbotData", JSON.stringify(e));
        localStorage.setItem("sweetbotSettings", JSON.stringify(t));
        console.log("Saved MORDOMO ChatBot data.")
    },
    getTime: function (e) {
        e = Math.floor(e / 6e4);
        var t = e - Math.floor(e / 60) * 60;
        var n = (e - t) / 60;
        var r = "";
        r += n < 10 ? "0" : "";
        r += n + "h";
        r += t < 10 ? "0" : "";
        r += t;
        return r
    },
    addUsers: function () {
        var e = API.getWaitList(),
         t = this.addToWL.length,
         n, r, i = true,
         s;
        if (t) {
            while (t--) {
                for (s in e) {
                    if (this.addToWL[t].id == e[s].id) {
                        this.addToWL.splice(t, 1);
                        break
                    }
                }
            }
            if (!this.addToWL.length) API.moderateLockWaitList(false);
            else if (e.length < 50) {
                n = this.addToWL[0].id, r = this.addToWL[0].pos;
                if (API.getUser().id != n) API.moderateAddDJ(n);
                else {
                    API.djJoin();
                    this.sendMsg("joined the waitlist")
                }
                setTimeout(function () {
                    API.moderateMoveDJ(n, r)
                }, 4e3)
            }
        }
    },
    getMehs: function () {
        var e = API.getUsers();
        var mehs = [];
        for (var t in e) if (e[t].vote == -1) mehs.push(e[t].username);
        API.chatLog(mehs.join(' | '), true);
    },
    stringFix: function (e) {
        e = e.replace(/&#39;/g, "'");
        e = e.replace(/&#34;/g, '"');
        e = e.replace(/&/g, "&");
        e = e.replace(/&lt;/g, "<");
        e = e.replace(/&gt;/g, ">");
        return e
    },
    sendMsg: function (e) {
        API.sendChat("/me " + e)
    },
    forceWoot: function () {
        var waitList = API.getWaitList(), index = {10: waitList[9], 5: waitList[4]};
        if (waitList.length >= 15 && sweetbot.userData[index[10].id].lastWoot > 3 && !sweetbot.userData[index[10].id].warns.forceWoot) {
            if (index[10].language === 'pt') API.sendChat('@' + index[10].username + ' Por favor, vote enquanto estiver na lista de espera, caso o contrário, voce será removido em 5 músicas!');
            else API.sendChat('@' + index[10].username + ' Please woot while in the waitlist, otherwise you will be removed in 5 songs!');
            sweetbot.userData[index[10].id].warns.forceWoot = true;
        }
        if (waitList.length >= 10 && sweetbot.userData[index[5].id].warns.forceWoot && sweetbot.userData[index[5].id].lastWoot > 5) {
            if (index[5].language === 'pt') API.sendChat('@' + index[5].username + ' Voce nao votou em ' + sweetbot.userData[index[5].id].lastWoot + ' Músicas, vote em quanto estiver na lista de espera na proxima vez!');
            else API.sendChat('@' + index[5].username + ' You have not wooted in ' + sweetbot.userData[index[5].id].lastWoot + ' songs, woot while in the waitlist next time!');
            API.moderateRemoveDJ(index[5].id);
            sweetbot.userData[index[5].id].warns.forceWoot = false;
        }
    },
    getModules : function(){
        var def = require.s.contexts._.defined,
            k = Object.keys(def);

        for (var j in k){
            if (!def[k[j]] || typeof def[k[j]] == 'function' || !Object.keys(def[k[j]]).length || (Object.keys(def[k[j]]).length <= 3 && !def[k[j]].length && !def[k[j]].emojify))
                continue;

            var obj = def[k[j]];
            if ( obj.attributes && obj.attributes.waitingDJs != null ){
                this.ctx.wl = obj;
                continue;
            }
            if ( obj.attributes && obj.attributes.joinTime != null ){
                this.ctx.room = obj;
                continue;
            }
        }
    },
    arrays: {
        ruleSkip: {},
        links: ["https://plug.dj/terms", "https://plug.dj/privacy", "https://plug.dj/about", "https://blog.plug.dj", "https://support.plug.dj"],
        spam: ["Puta"],
        off: ["nigger", "niggger", "spick", "porchmonkey", "Filho da puta", "towelhead", "Arrombado", "porch monkey"]
    }
};
stripLink = function(data){
       var div = document.createElement('DIV');
       div.innerHTML = data;
        return div.textContent || div.innerText || "";
}
//Array.prototype.rm=function(){var c,f=arguments,d=f.length,e;while(d&&this.length){c=f[--d];while((e=this.indexOf(c))!==-1){this.splice(e,1)}}return this};
String.prototype.startsWith=function(b){return "string" !== typeof b || b.length > this.length ? false : this.indexOf(b) === 0}; 
_.extend(sweetbot, Backbone.Events);
sweetbot.startup()
 
function adv(e){
      if(sweetbot.settings.b.autoSkip === true){
  clearTimeout(sweetbot.timeouts.autoSkip);
  if (e.media)
    sweetbot.timeouts.autoSkip=setTimeout(function(){API.moderateForceSkip();},(API.getTimeRemaining()+5)*1e3);
}
}
adv({media:API.getMedia()});