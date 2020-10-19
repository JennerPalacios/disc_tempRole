/*
Copyright (c) 2019 Jenner Palacios

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


//
// DISCORD JS
//
const Discord=require("discord.js");
const bot=new Discord.Client({fetchAllMembers: true}); bot.commands=new Discord.Collection();


//
// DEPENDENCIES AND SETTINGS
//
const fs=require("fs"), request=require("request"), botConfig=require("./config/config.json"),
	botLanguage=require("./lang/"+botConfig.language+".json"), botDefaultLanguage=require("./lang/default.json");
var myDB="disabled", sqlite="disabled";
if(botConfig.myDBserver){
	if(botConfig.myDBserver.enabled==="yes"){
		const mySQL=require("mysql");
		myDB=mySQL.createConnection(botConfig.myDBserver);
		myDB.connect(error=>{
			if(error){
				console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"ACCESS"+cc.cyan+" Database "+cc.reset+"(invalid login)\nRAW: "+error.sqlMessage)
			}
		});
	}
	else{
		sqlite=require("sqlite"); sqlite.open("./database/data.sqlite");
	}
}


//
// LOAD ALL COMMANDS
//
const commands=fs.readdirSync("./commands").filter(file=>file.endsWith(".js"));
for(const file of commands){
	const command=require("./commands/"+file);bot.commands.set(command.name,command);
}


//
// SHORTEN JSON DATA AND CONSOLE COLORS
//
const cc={"reset":"\x1b[0m","ul":"\x1b[4m","lred":"\x1b[91m","red":"\x1b[31m","lgreen":"\x1b[92m","green":"\x1b[32m","lyellow":"\x1b[93m","yellow":"\x1b[33m",
		"lblue":"\x1b[94m","blue":"\x1b[34m","lcyan":"\x1b[96m","cyan":"\x1b[36m","pink":"\x1b[95m","purple":"\x1b[35m","bgwhite":"\x1b[107m","bggray":"\x1b[100m",
		"bgred":"\x1b[41m","bggreen":"\x1b[42m","bglgreen":"\x1b[102m","bgyellow":"\x1b[43m","bgblue":"\x1b[44m","bglblue":"\x1b[104m","bgcyan":"\x1b[106m",
		"bgpink":"\x1b[105m","bgpurple":"\x1b[45m","hlwhite":"\x1b[7m","hlred":"\x1b[41m\x1b[30m","hlgreen":"\x1b[42m\x1b[30m","hlblue":"\x1b[44m\x1b[37m",
		"hlcyan":"\x1b[104m\x1b[30m","hlyellow":"\x1b[43m\x1b[30m","hlpink":"\x1b[105m\x1b[30m","hlpurple":"\x1b[45m\x1b[37m"};


//
// FUNCTION: TIME STAMP
//
function timeStamp(type){
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	if(!type || type===0){
	// 	YYYY/MM/DD HH:MM:SS |
		return cc.blue+yr+"/"+mo+"/"+da+" "+hr+":"+min+":"+sec+cc.reset+" |"
	}
	if(type===1){
		let dateFormatArr=botConfig.dateFormat.split("/");
		let dateVal01, dateVal02, dateVal03;
		if(dateFormatArr[0]==="mm"){dateVal01=mo;}if(dateFormatArr[0]==="dd"){dateVal01=da;}if(dateFormatArr[0]==="yy"){yr=yr.toString();dateVal01=yr.slice(2);}if(dateFormatArr[0]==="yyyy"){dateVal01=yr;}
		if(dateFormatArr[1]==="mm"){dateVal02=mo;}if(dateFormatArr[1]==="dd"){dateVal02=da;}if(dateFormatArr[1]==="yy"){yr=yr.toString();dateVal02=yr.slice(2);}if(dateFormatArr[1]==="yyyy"){dateVal02=yr;}
		if(dateFormatArr[2]==="mm"){dateVal03=mo;}if(dateFormatArr[2]==="dd"){dateVal03=da;}if(dateFormatArr[2]==="yy"){yr=yr.toString();dateVal03=yr.slice(2);}if(dateFormatArr[2]==="yyyy"){dateVal03=yr;}
		// 	`MM/DD/YYYY @ HH:MM:SS`
		return "`"+dateVal01+"/"+dateVal02+"/"+dateVal03+" @ "+hr+":"+min+":"+sec+"`"
	}
}



//
// DATABASE TIMER FOR TEMPORARY ROLES
//
setInterval(function(){
	let timeNow=new Date().getTime(),dbTime="",daysLeft="",logginChannel="",member="";
	if(myDB!=="disabled"){
		myDB.query(`SELECT * FROM TempRole_bot.temporaryRoles;`,(error,results)=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"SELECT FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
			else{
				if(results.length<1){
					return;
				}
				else{
					let rows=results;
					for(let rowNumber="0"; rowNumber<rows.length; rowNumber++){
						dbTime=rows[rowNumber].endDate; daysLeft=(dbTime*1)-(timeNow*1);
						member=bot.guilds.get(rows[rowNumber].guildID).members.get(rows[rowNumber].userID) || "notFound";
						if(botConfig.remindAtDays){
							let daysRemaining=Math.ceil(daysLeft/86400000), remindAt=(botConfig.remindAtDays*1), dayORdays=" day";
							if(botConfig.remindAtDays>1){dayORdays=" days"}
							if(daysRemaining===remindAt){
								myDB.query(`UPDATE TempRole_bot.temporaryRoles SET reminderSent=? WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}";`,
									["yes"],error=>{
										if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
									}
								);
								if(rows[rowNumber].reminderSent===null || rows[rowNumber].reminderSent==="no"){
									if(member!=="notFound"){
										console.info(timeStamp()+" "+cc.lblue+rows[rowNumber].userName+cc.reset+"'s "+cc.green+"temporary role"+cc.reset+" is expiring soon, sending notification..."+cc.reset);
										if(botLanguage){
											if(botLanguage.messageToMember){
												if(botLanguage.messageToMember.reminder){
													member.send(
														botLanguage.messageToMember.replace("%member%","<@"+rows[rowNumber].userID+">")
															.replace("%daysAmount%",rows[rowNumber].temporaryRole)
															.replace("%daysAmount%",daysRemaining+dayORdays)
															.replace("%botOwner%","<@"+botConfig.ownerID+">")
													)
													.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs, blocked me, or is no longer in server"))
												}
											}
										}
										else{
											member.send(
												botDefaultLanguage.messageToMember.reminder.replace("%member%","<@"+rows[rowNumber].userID+">")
													.replace("%roleName%",rows[rowNumber].temporaryRole)
													.replace("%daysAmount%",daysRemaining+dayORdays)
													.replace("%botOwner%","<@"+botConfig.ownerID+">")
											)
											.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs, blocked me, or is no longer in server"))
										}
									}
								}
							}
						}
						if(daysLeft<1){
							let finalName=rows[rowNumber].userName, finalID=rows[rowNumber].userID;
							if(botConfig.logChannelID){
								bot.channels.get(botConfig.logChannelID)
								.send(botLanguage.messageToMember.replace("%member%","<@"+rows[rowNumber].userID+">").replace("%roleName%",rows[rowNumber].temporaryRole))
								.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not send message to channel | "+error.message));
							}
							if(member==="notFound"){
								console.info(
									timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+cc.cyan+rows[rowNumber].userName+cc.reset+"("+cc.lblue+rows[rowNumber].userID+cc.reset
									+") was not found in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset+" | They will be removed from "+cc.cyan+"TemporaryRoles"+cc.reset+" DataBase"
								);
							}
							else{
								finalName=member.user.username; finalID=member.user.id;
								let roleToRemove=bot.guilds.get(rows[rowNumber].guildID).roles.find(role=>role.name===rows[rowNumber].temporaryRole) || "notFound";
								if(roleToRemove==="notFound"){
									console.info(
										timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" The "+cc.green+"temporary"+cc.reset+" role: "+cc.cyan+rows[rowNumber].temporaryRole+cc.reset+" was "
										+cc.red+"not"+cc.reset+" found in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset+" | But dbEntry will be "+cc.green+"removed"+cc.reset+" from DataBase"
									);
								}
								else{
									member.send(
										botLanguage.messageToMember.replace("%member%","<@"+rows[rowNumber].userID+">")
											.replace("%roleName%",rows[rowNumber].temporaryRole)
											.replace("%botOwner%","<@"+botConfig.ownerID+">")
									)
									.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs, blocked me, or is no longer in server"));
									
									if(member.roles.has(roleToRemove.id)){
										member.removeRole(roleToRemove)
										.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"removeRole()"+cc.reset+" from member | "+error.message));
									}
								}
								console.log(
									timeStamp()+" "+cc.cyan+finalName+cc.reset+"("+cc.lblue+finalID+cc.reset+") have lost their "
									+cc.green+"temporary"+cc.reset+" role: "+cc.red+rows[rowNumber].temporaryRole+cc.reset+", in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset
								);
							}
							myDB.query(`DELETE FROM TempRole_bot.temporaryRoles WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}";`,error=>{
								if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"DELETE FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
							});
						}
					}
				}
			}
		});
	}
	else{
		/*
		sqlite.all(`SELECT * FROM temporaryRoles;`).then(rows=>{
			if(rows.length<1){return}
			else{
				for(let rowNumber="0"; rowNumber<rows.length; rowNumber++){
					dbTime=rows[rowNumber].endDate; daysLeft=(dbTime*1)-(timeNow*1);
					sid=getGuild(rows[rowNumber].guildID);if(sid===undefined){return}
					member=bot.guilds.get(rows[rowNumber].guildID).members.get(rows[rowNumber].userID) || "notFound";
					if(botConfig.servers[sid].id){
						if(botConfig.servers[sid].tempRoles){
							if(botConfig.servers[sid].tempRoles.remindAtDays){
								let daysRemaining=Math.ceil(daysLeft/86400000), remindAt=(botConfig.servers[sid].tempRoles.remindAtDays*1), dayORdays=" day";
								if(botConfig.servers[sid].tempRoles.remindAtDays>1){dayORdays=" days"}
								if(daysRemaining===remindAt){
									sqlite.run(`UPDATE temporaryRoles SET reminderSent=? WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}";`,["yes"])
									.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporaryRoles"+cc.reset+" table | "+error.message));
									if(rows[rowNumber].reminderSent===null || rows[rowNumber].reminderSent==="no"){
										if(member!=="notFound"){
											if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
												console.info(timeStamp()+" "+cc.lblue+rows[rowNumber].userName+cc.reset+"'s "
												+cc.green+"temporary role"+cc.reset+" is expiring soon, sending notification..."+cc.reset);
											}
											member.send(
												"⚠ <@"+rows[rowNumber].userID+">, you will **lose** your role: **"+rows[rowNumber].temporaryRole+"** "
												+"in `"+daysRemaining+dayORdays+"`. Please contact <@"+botConfig.ownerID
												+"> if you wish to renew your **temporary role**."
											)
											.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs, blocked me, or is no longer in server"));
										}
									}
								}
							}
						}
					}
					if(daysLeft<1){
						let finalName=rows[rowNumber].userName, finalID=rows[rowNumber].userID;
						if(botConfig.servers[sid].id){
							if(botConfig.servers[sid].serverEvents){
								if(botConfig.servers[sid].serverEvents.roleChannelID){
									bot.channels.get(botConfig.servers[sid].serverEvents.roleChannelID)
									.send("⚠ <@"+rows[rowNumber].userID+"> have **lost** their role: **"+rows[rowNumber].temporaryRole+"** - their **temporary** access has __EXPIRED__ 😭")
									.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not send message to channel | "+error.message));
									logginChannel=botConfig.servers[sid].serverEvents.roleChannelID;
								}
							}
						}
						if(botConfig.serverEvents){
							if(botConfig.serverEvents.roleChannelID){
								if(botConfig.serverEvents.roleChannelID){
									if(logginChannel!==botConfig.serverEvents.roleChannelID){
										bot.channels.get(botConfig.serverEvents.joinChannelID)
										.send("⚠ <@"+rows[rowNumber].userID+"> have **lost** their role: **"+rows[rowNumber].temporaryRole+"** - their **temporary** access has __EXPIRED__ 😭")
										.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not send message to channel | "+error.message));
									}
								}
							}
						}
						if(member==="notFound"){
							console.info(
								timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+cc.cyan+rows[rowNumber].userName+cc.reset+"("+cc.lblue+rows[rowNumber].userID+cc.reset
								+") was not found in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset+" | They will be removed from "+cc.cyan+"TemporaryRoles"+cc.reset+" DataBase"
							);
						}
						else{
							finalName=member.user.username; finalID=member.user.id;
							let roleToRemove=bot.guilds.get(rows[rowNumber].guildID).roles.find(role=>role.name===rows[rowNumber].temporaryRole) || "notFound";
							if(roleToRemove==="notFound"){
								console.info(
									timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" The "+cc.green+"temporary"+cc.reset+" role: "+cc.cyan+rows[rowNumber].temporaryRole+cc.reset+" was "
									+cc.red+"not"+cc.reset+" found in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset+" | But dbEntry will be "+cc.green+"removed"+cc.reset+" from DataBase"
								);
							}
							else{
								member.send(
									"⚠ <@"+rows[rowNumber].userID+">, you have **lost** your role: **"+rows[rowNumber].temporaryRole+"** - your **temporary**"
									+"access has __EXPIRED__ 😭 \nPlease contact <@"+botConfig.ownerID+"> if you wish to renew your **temporary role**."
								)
								.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs, blocked me, or is no longer in server"));
								
								if(member.roles.has(roleToRemove.id)){
									member.removeRole(roleToRemove)
									.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"removeRole()"+cc.reset+" from member | "+error.message));
								}
							}
							console.log(
								timeStamp()+" "+cc.cyan+finalName+cc.reset+"("+cc.lblue+finalID+cc.reset+") have lost their "
								+cc.green+"temporary"+cc.reset+" role: "+cc.red+rows[rowNumber].temporaryRole+cc.reset+", in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset
							);
						}
						sqlite.run(`DELETE FROM temporaryRoles WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}";`)
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"DELETE FROM"+cc.reset+" database | "+error.message));
					}
				}
			}
		})
		.catch(error=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"SELECT FROM"+cc.cyan+" database | "+error.message)});
		*/
	}
},3600000);
// 86400000 = 24hrs
// 43200000 = 12hrs
// 21600000 = 6hrs
// 10800000 = 3hrs
// 3600000 = 1hr <-
// 1800000 = 30mins



//
// UNHANDLED REJECTION/PROMISE
//
process.on("unhandledRejection",error=>console.log(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Uncaught Promise Rejection:\n"+error));



//
// BOT SIGNED IN AND IS READY
//
bot.on("ready", ()=>{
	botConfig.botVersion="1.0";
	console.info(timeStamp()+" -- DISCORD TEMP-ROLE[BOT]: "+cc.yellow+bot.user.username+cc.reset+", IS "+cc.green+"READY"+cc.reset+"! --");

	// VERSION CHECKER
	request("https://raw.githubusercontent.com/JennerPalacios/disc_tempRole/master/version.txt",(error,response,body)=>{
		if(error){
			console.info(timeStamp()+" "+cc.hlred+"ERROR "+cc.reset+" Could not load version from gitHub | "+error);
		}
		if(body){
			let gitHubVer=body.slice(0,-1); let timeLog=timeStamp();
			let verChecker=cc.green+"up-to-date"+cc.reset; if(gitHubVer!==botConfig.botVersion){ verChecker=cc.hlred+" OUTDATED! "+cc.reset }
			console.info(
				timeLog+" GitHub Discord Bot [TempRole]: "+cc.yellow+"v"+gitHubVer+cc.reset+"\n"
				+timeLog+" Local Discord Bot ["+bot.user.username+"]: "+cc.yellow+"v"+botConfig.botVersion+cc.reset+" -> "+verChecker+"\n"
				+timeLog+" Discord API [discord.js]: "+cc.yellow+"v"+Discord.version+cc.reset+"\n"
				+timeLog+" Node API [node.js] version: "+cc.yellow+process.version+cc.reset
			);
		}
	});
	//
	// DATABASE FILE AND TABLE CREATION
	//
	//CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
	if(myDB!=="disabled"){
		// CREATE DATABASE
		myDB.query(`CREATE DATABASE IF NOT EXISTS TempRole_bot CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,error=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE DATABASE"+cc.cyan+" TempRole_bot "+cc.reset+"\nRAW: "+error)}
		});
		
		// CREATE TABLE TEMPORARY ROLES
		myDB.query(`CREATE TABLE IF NOT EXISTS TempRole_bot.temporaryRoles (userID TEXT,userName TEXT,temporaryRole TEXT,guildID TEXT,guildName TEXT,startDate TEXT,endDate TEXT,addedByID TEXT,addedByName TEXT);`,error=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" temporaryRoles "+cc.reset+"in database\nRAW: "+error)}
		});
		myDB.query(`SELECT reminderSent FROM TempRole_bot.temporaryRoles;`,async (error,results)=>{
			if(error){
				console.info(timeStamp()+" "+cc.hlblue+" WARNING "+cc.reset+" Could not "+cc.yellow+"SELECT reminderSent FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error
					+"\n"+timeStamp()+" Column above did not exist. Adding column to table...");
				myDB.query(`ALTER TABLE TempRole_bot.temporaryRoles ADD COLUMN reminderSent TEXT AFTER addedByName;`,error=>{
					if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"ALTER TABLE"+cc.cyan+" temporaryRoles "+cc.reset+"in database\nRAW: "+error)}
				});
			}
		});
	}
	else{
		// TEMPORARY ROLES
		sqlite.run(`CREATE TABLE IF NOT EXISTS temporaryRoles (userID TEXT, userName TEXT, temporaryRole TEXT, guildID TEXT, guildName TEXT, startDate TEXT, endDate TEXT, addedByID TEXT, addedByName TEXT);`)
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" temporaryRoles "+cc.reset+"in database | "+error.message));
		sqlite.all(`SELECT reminderSent FROM temporaryRoles`)
		.catch(err=>{
			sqlite.run(`ALTER TABLE temporaryRoles ADD COLUMN reminderSent TEXT AFTER addedByName;`)
			.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"ALTER"+cc.cyan+" temporaryRoles"+cc.reset+" table | "+error.message));
			console.info(timeStamp()+" "+cc.hlblue+" NOTICE "+cc.reset+" Could not "+cc.yellow+"SELECT reminderSent FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+err.message
				+"\n"+timeStamp()+" Column above did not exist. Adding column to table...")
		});
	}
});



//////////////////////////////////////////////////////////////////////////////////////////////////
//																								//
//									MESSAGE LISTENER											//
//																								//
//////////////////////////////////////////////////////////////////////////////////////////////////
bot.on("message",message=>{
	if(!message.member){return}if(!message.member.user){return}if(!message.member.user.username){return}
	if(message.member.user.bot || message.channel.type==="dm"){return}if(!message.content){return}

	// DEFINE SHORTER DISCORD PROPERTIES
	let guild=message.guild, channel=message.channel, member=message.member;

	// GRAB COMMAND
	let command=message.content.toLowerCase().split(/ +/)[0]; command=command.slice(botConfig.cmdPrefix.length);

	// GRAB ARGUMENTS
	let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1);

	// GRAB ADMINS AND MODERATORS
	let adminRole=guild.roles.find(role=>role.name===botConfig.adminRoleName);
		if(!adminRole){
			adminRole={"id":"10101"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
				+cc.red+"adminRoleName"+cc.reset+": "+cc.cyan+botConfig.adminRoleName+cc.reset+" for server: "
				+cc.lblue+guild.name+cc.reset+" in "+cc.purple+"botConfig.json"+cc.reset)}
	let modRole=guild.roles.find(role=>role.name===botConfig.modRoleName);
		if(!modRole){
			modRole={"id":"10101"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
				+cc.red+"modRoleName"+cc.reset+": "+cc.cyan+botConfig.modRoleName+cc.reset+" for server: "
				+cc.lblue+guild.name+cc.reset+" in "+cc.purple+"botConfig.json"+cc.reset)}
	//
	
	
	//
	// COMMAND LISTENER
	//
	if(!message.content.startsWith(botConfig.cmdPrefix)){
		return console.info(timeStamp()+" "+cc.purple+"#"+channel.name+cc.reset+" | "+cc.lblue+member.user.username+cc.reset+": "+message.content);
	}

	// RELOAD COMMAND - OWNER ONLY
	if(command==="reload" && member.id===botConfig.ownerID){
		if(args.length<1){
			let theCommands=bot.commands.map(cmds=>cmds.name);
			return channel.send("ℹ "+member+", modules available(`"+theCommands.length+"`):```md\nall, bot, "+theCommands.join(", ")+"```");
		}
		if(args[0]==="all" || args[0]==="bot"){
			return channel.send("♻ Restarting **BOT**... please wait `3` to `5` seconds...").then(()=>{ process.exit(1) })
			.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
		}
		if(!bot.commands.has(args[0])){
			let theCommands=bot.commands.map(cmds=>cmds.name);
			return channel.send("⛔ "+member+", that command/file does not exist!\nAvailable(`"+theCommands.length+"`):```md\nall, bot, "+theCommands.join(", ")+"```");
		}
		delete require.cache[require.resolve(`./commands/${args[0]}.js`)];bot.commands.delete(args[0]);
		const props=require(`./commands/${args[0]}.js`); bot.commands.set(args[0],props);
		return channel.send("✅ "+member+", I have successfuly reloaded: `"+args[0]+".js`")
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
	}
	
	// DYNAMIC COMMAND HANDLER
	if(bot.commands.has(command) || bot.commands.find(cmd=>cmd.aliases && cmd.aliases.includes(command))){
		console.info(timeStamp()+" "+cc.purple+"#"+channel.name+cc.reset+" | "+cc.hlblue+" COMMAND "+cc.reset+" "+cc.lblue+member.user.username+cc.reset+": "+message.content);
		try{
			const COMMAND=bot.commands.get(command) || bot.commands.find(cmd=>cmd.aliases && cmd.aliases.includes(command));
			COMMAND.execute(
				timeStamp(),timeStamp(1),cc,message,bot.guilds,bot.channels,bot.users,botConfig,botLanguage,botDefaultLanguage
			);
		}
		catch(error){
			console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" | "+error);
		}
		return;
	}
});



//
// CONNECT BOT TO DISCORD
//
bot.login(botConfig.token);


//
// DISCONNECTED
//
bot.on("disconnect", function (){
	console.info(timeStamp()+cc.bgred+" -- DISCORD HELPBOT HAS DISCONNECTED --"+cc.reset)
});
