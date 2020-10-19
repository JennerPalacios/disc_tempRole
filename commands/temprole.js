module.exports={
	name: "temprole",
	aliases: ["temproles","troles","trole","tr"],
	async execute(timeStamp,timeStampEmbed,cc,message,botGuilds,botChannels,botUsers,botConfig,botLanguage,botDefaultLanguage){
		var myDB="disabled", sqlite="disabled", translation="yes";
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
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionMember="notMentioned",guild=message.guild,channel=message.channel,member=message.member;
		
		// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
		if(message.mentions.users.first()){mentionMember=await guild.fetchMember(message.mentions.users.first())}
		
		// GRAB ADMINS AND MODERATORS
		let adminRole=guild.roles.find(role=>role.name===botConfig.adminRoleName);
			if(!adminRole){
				adminRole={"id":"10101"};console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
					+cc.red+"adminRoleName"+cc.reset+": "+cc.cyan+botConfig.adminRoleName+cc.reset+" for server: "
					+cc.lblue+guild.name+cc.reset+" in "+cc.purple+"botConfig.json"+cc.reset)}
		let modRole=guild.roles.find(role=>role.name===botConfig.modRoleName);
			if(!modRole){
				modRole={"id":"10101"};console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
					+cc.red+"modRoleName"+cc.reset+": "+cc.cyan+botConfig.modRoleName+cc.reset+" for server: "
					+cc.lblue+guild.name+cc.reset+" in "+cc.purple+"botConfig.json"+cc.reset)}
		
		// DEFAULT EMBED MESSAGE
		let embedMSG={
			"embed": {
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "```md\n"+botConfig.cmdPrefix+"tempRole check <@mention/id>\n"
					+botConfig.cmdPrefix+"tempRole remove <@mention/id> <roleName>\n"
					+botConfig.cmdPrefix+"tempRole <@mention/id> <numberOfDays> <roleName>```"
			}
		};
		
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				
				if(Number.isInteger(parseInt(args[0]))){if(args[0].length>17){mentionMember=await guild.fetchMember(botUsers.get(args[0]))}}
				if(!args[0].startsWith("<@") && Number.isInteger(parseInt(args[1]))){if(args[1].length>17){mentionMember=await guild.fetchMember(botUsers.get(args[1]))}}
				if(!mentionMember.id){
					if(botLanguage){
						if(botLanguage.messageToExecuter){
							if(botLanguage.messageToExecuter.memberNotMention){
								return channel.send(
									botLanguage.messageToExecuter.memberNotMention.replace("%member%",member)
								)
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							else{translation="no"}
						}
						else{translation="no"}
					}
					else{translation="no"}
					if(translation==="no"){
						return channel.send(
							botDefaultLanguage.messageToExecuter.memberNotMention.replace("%member%",member)
						)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
				else{
					let dateMultiplier=86400000;
					
					if(args[0]==="check"){
						if(myDB!=="disabled"){
							myDB.query(`SELECT * FROM TempRole_bot.temporaryRoles WHERE userID="${mentionMember.id}" AND guildID="${botConfig.serverID}";`,async (error,results)=>{
								if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
								else{
									if(results.length<1){
										if(botLanguage){
											if(botLanguage.messageToExecuter){
												if(botLanguage.messageToExecuter.noRolesFound){
													return channel.send(
														botLanguage.messageToExecuter.noRolesFound.replace("%member%",member)
															.replace("%mentions%",mentionMember)
													)
													.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
												}
												else{translation="no"}
											}
											else{translation="no"}
										}
										else{translation="no"}
										if(translation==="no"){
											return channel.send(
												botDefaultLanguage.messageToExecuter.noRolesFound.replace("%member%",member)
													.replace("%mentions%",mentionMember)
											)
											.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
										}
									}
									else{
										let daRolesFindings="";
										if(botLanguage){
											if(botLanguage.messageToExecuter){
												if(botLanguage.messageToExecuter.rolesFoundTitle){
													daRolesFindings=botLanguage.messageToExecuter.rolesFoundTitle.replace("%mentions%",mentionMember)
												}
												else{translation="no"}
											}
											else{translation="no"}
										}
										else{translation="no"}
										if(translation==="no"){
											daRolesFindings=botDefaultLanguage.messageToExecuter.rolesFoundTitle.replace("%mentions%",mentionMember)
										}
										for(rowNumber="0"; rowNumber<results.length; rowNumber++){
											let dateFormatArr=botConfig.dateFormat.split("/");
											let dateVal01, dateVal02, dateVal03, yr, mo, da;
											
											let startDateVal=new Date(); startDateVal.setTime(results[rowNumber].startDate);
											yr=startDateVal.getFullYear();mo=startDateVal.getMonth()+1;if(mo<10){mo="0"+mo;}da=startDateVal.getDate();if(da<10){da="0"+da;}
											if(dateFormatArr[0]==="mm"){dateVal01=mo;}if(dateFormatArr[0]==="dd"){dateVal01=da;}if(dateFormatArr[0]==="yy"){yr=yr.toString();dateVal01=yr.slice(2);}if(dateFormatArr[0]==="yyyy"){dateVal01=yr;}
											if(dateFormatArr[1]==="mm"){dateVal02=mo;}if(dateFormatArr[1]==="dd"){dateVal02=da;}if(dateFormatArr[1]==="yy"){yr=yr.toString();dateVal02=yr.slice(2);}if(dateFormatArr[1]==="yyyy"){dateVal02=yr;}
											if(dateFormatArr[2]==="mm"){dateVal03=mo;}if(dateFormatArr[2]==="dd"){dateVal03=da;}if(dateFormatArr[2]==="yy"){yr=yr.toString();dateVal03=yr.slice(2);}if(dateFormatArr[2]==="yyyy"){dateVal03=yr;}
											
											startDateVal=dateVal01+"/"+dateVal02+"/"+dateVal03;
											
											
											let endDateVal=new Date(); endDateVal.setTime(results[rowNumber].endDate);
											yr=endDateVal.getFullYear();mo=endDateVal.getMonth()+1;if(mo<10){mo="0"+mo;}da=endDateVal.getDate();if(da<10){da="0"+da;}
											if(dateFormatArr[0]==="mm"){dateVal01=mo;}if(dateFormatArr[0]==="dd"){dateVal01=da;}if(dateFormatArr[0]==="yy"){yr=yr.toString();dateVal01=yr.slice(2);}if(dateFormatArr[0]==="yyyy"){dateVal01=yr;}
											if(dateFormatArr[1]==="mm"){dateVal02=mo;}if(dateFormatArr[1]==="dd"){dateVal02=da;}if(dateFormatArr[1]==="yy"){yr=yr.toString();dateVal02=yr.slice(2);}if(dateFormatArr[1]==="yyyy"){dateVal02=yr;}
											if(dateFormatArr[2]==="mm"){dateVal03=mo;}if(dateFormatArr[2]==="dd"){dateVal03=da;}if(dateFormatArr[2]==="yy"){yr=yr.toString();dateVal03=yr.slice(2);}if(dateFormatArr[2]==="yyyy"){dateVal03=yr;}
											
											finalDate=dateVal01+"/"+dateVal02+"/"+dateVal03;
											
											if(botLanguage){
												if(botLanguage.messageToExecuter){
													if(botLanguage.messageToExecuter.rolesFoundList){
														daRolesFindings+=botLanguage.messageToExecuter.rolesFoundList.replace("%roleName%",results[rowNumber].temporaryRole)
															.replace("%endDate%",finalDate)
															.replace("%addedBy%","<@"+results[rowNumber].addedByID+">")
															.replace("%addedDate%",startDateVal)
													}
													else{translation="no"}
												}
												else{translation="no"}
											}
											else{translation="no"}
											if(translation==="no"){
												daRolesFindings+=botDefaultLanguage.messageToExecuter.rolesFoundList.replace("%roleName%",results[rowNumber].temporaryRole)
													.replace("%endDate%",finalDate)
													.replace("%addedBy%","<@"+results[rowNumber].addedByID+">")
													.replace("%addedDate%",startDateVal)
											}
										}
										return channel.send(daRolesFindings).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									}
								}
							});
						}
						else{
							/*
							sqlite.all(`SELECT * FROM temporaryRoles WHERE userID="${mentionMember.id}" AND guildID="${botConfig.serverID}";`)
							.then(rows=>{
								if(rows.length<1){
									return channel.send("⚠ "+mentionMember+" does **NOT** have any `temporary roles`, "+member)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
								else{
									let daRolesFindings="✅ "+mentionMember+"'s TemporaryRole(s):\n";
									for(rowNumber="0"; rowNumber<rows.length; rowNumber++){
										let startDateVal=new Date(); startDateVal.setTime(rows[rowNumber].startDate);
										startDateVal=(startDateVal.getMonth()+1)+"/"+startDateVal.getDate()+"/"+startDateVal.getFullYear();
										let endDateVal=new Date(); endDateVal.setTime(rows[rowNumber].endDate);
										finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
										daRolesFindings+="**"+rows[rowNumber].temporaryRole+"**, ends:`"+finalDate+"`, addedBy: <@"+rows[rowNumber].addedByID+"> on:`"+startDateVal+"`\n";
									}
									return channel.send(daRolesFindings).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
							})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message)); return;
							*/
						}
						return;
					}
					
					if(args[0]==="remove"){
						let roleSearched=ARGS.slice(2).join(" ");
						if(args.length<3){
							if(botLanguage){
								if(botLanguage.messageToExecuter){
									if(botLanguage.messageToExecuter.roleRemoveNotMention){
										return channel.send(
											botLanguage.messageToExecuter.roleRemoveNotMention.replace("%member%",member)
												.replace("%mentions%",mentionMember)
										)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									}
									else{translation="no"}
								}
								else{translation="no"}
							}
							else{translation="no"}
							if(translation==="no"){
								return channel.send(
									botDefaultLanguage.messageToExecuter.roleRemoveNotMention.replace("%member%",member)
										.replace("%mentions%",mentionMember)
								)
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
						}
						if(myDB!=="disabled"){
							myDB.query(`SELECT * FROM TempRole_bot.temporaryRoles WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${botConfig.serverID}";`,async (error,results)=>{
								if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
								else{
									if(results.length<1){
										if(botLanguage){
											if(botLanguage.messageToExecuter){
												if(botLanguage.messageToExecuter.roleMemberNotInDB){
													return channel.send(
														botLanguage.messageToExecuter.roleMemberNotInDB.replace("%member%",member)
															.replace("%mentions%",mentionMember)
															.replace("%roleName%",roleSearched)
													)
													.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
												}
												else{translation="no"}
											}
											else{translation="no"}
										}
										else{translation="no"}
										if(translation==="no"){
											return channel.send(
												botDefaultLanguage.messageToExecuter.roleMemberNotInDB.replace("%member%",member)
													.replace("%mentions%",mentionMember)
													.replace("%roleName%",roleSearched)
											)
											.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
										}
									}
									else{
										let theirRole=guild.roles.find(role=>role.name===roleSearched);
										if(mentionMember.roles.has(theirRole.id)){
											mentionMember.removeRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
										}
										myDB.query(`DELETE FROM TempRole_bot.temporaryRoles WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${botConfig.serverID}";`,async (error,results)=>{
											if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
											else{
												if(botLanguage){
													if(botLanguage.messageToChannel){
														if(botLanguage.messageToChannel.roleRemoved){
															return channel.send(
																botLanguage.messageToChannel.roleRemoved.replace("%member%",member)
																	.replace("%mentions%",mentionMember)
																	.replace("%roleName%",roleSearched)
															)
															.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
														}
														else{translation="no"}
													}
													else{translation="no"}
												}
												else{translation="no"}
												if(translation==="no"){
													return channel.send(
														botDefaultLanguage.messageToChannel.roleRemoved.replace("%member%",member)
															.replace("%mentions%",mentionMember)
															.replace("%roleName%",roleSearched)
													)
													.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
												}
											}
										});
									}
								}
							});
						}
						else{
							/*
							sqlite.get(`SELECT * FROM temporaryRoles WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${botConfig.serverID}"`)
							.then(row=>{
								if(!row){
									return channel.send("⛔ "+mentionMember+" with role: `"+roleSearched+"` is __NOT__ in my `DataBase`, "+member);
								}
								else{
									let theirRole=guild.roles.find(role=>role.name===row.temporaryRole);
									if(mentionMember.roles.has(theirRole.id)){
										mentionMember.removeRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									}
									sqlite.get(`DELETE FROM temporaryRoles WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${botConfig.serverID}"`)
									.then(row=>{
										return channel.send("⚠ "+mentionMember+" have **lost** their role: **"+theirRole.name+"** and has been removed from my `DataBase`, "+member);
									});
								}
							})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							*/
						}
						return;
					}
					
					if(args.length<2){
						if(botLanguage){
							if(botLanguage.messageToExecuter){
								if(botLanguage.messageToExecuter.daysNotMention){
									return channel.send(
										botLanguage.messageToExecuter.daysNotMention.replace("%member%",member)
											.replace("%mentions%",mentionMember)
									)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
								else{translation="no"}
							}
							else{translation="no"}
						}
						else{translation="no"}
						if(translation==="no"){
							return channel.send(
								botDefaultLanguage.messageToExecuter.daysNotMention.replace("%member%",member)
									.replace("%mentions%",mentionMember)
							)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
					if(Number.isInteger(parseInt(args[0])) && !Number.isInteger(parseInt(args[1]))){
						if(botLanguage){
							if(botLanguage.messageToExecuter){
								if(botLanguage.messageToExecuter.daysNotMention){
									return channel.send(
										botLanguage.messageToExecuter.daysNotMention.replace("%member%",member)
											.replace("%mentions%",mentionMember)
									)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
								else{translation="no"}
							}
							else{translation="no"}
						}
						else{translation="no"}
						if(translation==="no"){
							return channel.send(
								botDefaultLanguage.messageToExecuter.daysNotMention.replace("%member%",member)
									.replace("%mentions%",mentionMember)
							)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
					if(args[0].startsWith("<@") && !Number.isInteger(parseInt(args[1]))){
						if(botLanguage){
							if(botLanguage.messageToExecuter){
								if(botLanguage.messageToExecuter.daysNotMention){
									return channel.send(
										botLanguage.messageToExecuter.daysNotMention.replace("%member%",member)
											.replace("%mentions%",mentionMember)
									)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
								else{translation="no"}
							}
							else{translation="no"}
						}
						else{translation="no"}
						if(translation==="no"){
							return channel.send(
								botDefaultLanguage.messageToExecuter.daysNotMention.replace("%member%",member)
									.replace("%mentions%",mentionMember)
							)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
					
					else if(args.length<3){
						if(botLanguage){
							if(botLanguage.messageToExecuter){
								if(botLanguage.messageToExecuter.roleAddNotMention){
									return channel.send(
										botLanguage.messageToExecuter.roleAddNotMention.replace("%member%",member)
											.replace("%mentions%",mentionMember)
									)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
								else{translation="no"}
							}
							else{translation="no"}
						}
						else{translation="no"}
						if(translation==="no"){
							return channel.send(
								botDefaultLanguage.messageToExecuter.roleAddNotMention.replace("%member%",member)
									.replace("%mentions%",mentionMember)
							)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
					
					let roleSearched=ARGS.slice(2).join(" ");
					
					let guildRole=guild.roles.find(role=>role.name===roleSearched);
					if(!guildRole){
						if(botLanguage){
							if(botLanguage.messageToExecuter){
								if(botLanguage.messageToExecuter.roleNotFoundInServer){
									return channel.send(
										botLanguage.messageToExecuter.roleNotFoundInServer.replace("%member%",member)
									)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
								else{translation="no"}
							}
							else{translation="no"}
						}
						else{translation="no"}
						if(translation==="no"){
							return channel.send(
								botDefaultLanguage.messageToExecuter.roleNotFoundInServer.replace("%member%",member)
							)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
					
					
					if(myDB!=="disabled"){
						myDB.query(`SELECT * FROM TempRole_bot.temporaryRoles WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${botConfig.serverID}";`,async (error,results)=>{
							if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
							else{
								if(results.length>0){
									let dateFormatArr=botConfig.dateFormat.split("/");
									let dateVal01, dateVal02, dateVal03, yr, mo, da;
									
									let newFinalDate=((args[1])*(dateMultiplier)); newFinalDate=((results[0].endDate*1)+(newFinalDate*1));
									let endDateVal=new Date(); endDateVal.setTime(newFinalDate);
									yr=endDateVal.getFullYear();mo=endDateVal.getMonth()+1;if(mo<10){mo="0"+mo;}da=endDateVal.getDate();if(da<10){da="0"+da;}
									if(dateFormatArr[0]==="mm"){dateVal01=mo;}if(dateFormatArr[0]==="dd"){dateVal01=da;}if(dateFormatArr[0]==="yy"){yr=yr.toString();dateVal01=yr.slice(2);}if(dateFormatArr[0]==="yyyy"){dateVal01=yr;}
									if(dateFormatArr[1]==="mm"){dateVal02=mo;}if(dateFormatArr[1]==="dd"){dateVal02=da;}if(dateFormatArr[1]==="yy"){yr=yr.toString();dateVal02=yr.slice(2);}if(dateFormatArr[1]==="yyyy"){dateVal02=yr;}
									if(dateFormatArr[2]==="mm"){dateVal03=mo;}if(dateFormatArr[2]==="dd"){dateVal03=da;}if(dateFormatArr[2]==="yy"){yr=yr.toString();dateVal03=yr.slice(2);}if(dateFormatArr[2]==="yyyy"){dateVal03=yr;}
									
									finalDate=dateVal01+"/"+dateVal02+"/"+dateVal03;
											
									myDB.query(`UPDATE TempRole_bot.temporaryRoles SET endDate=?, reminderSent=? WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${botConfig.serverID}";`,
										[newFinalDate,"no"],error=>{
											if(error){
												console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);
											}
											else{
												if(botLanguage){
													if(botLanguage.messageToChannel){
														if(botLanguage.messageToChannel.roleExtended){
															return channel.send(
																botLanguage.messageToChannel.roleExtended.replace("%mentions%",mentionMember)
																	.replace("%roleName%",roleSearched)
																	.replace("%days%",args[1])
																	.replace("%endDate%",finalDate)
															)
															.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
														}
														else{translation="no"}
													}
													else{translation="no"}
												}
												else{translation="no"}
												if(translation==="no"){
													return channel.send(
														botDefaultLanguage.messageToChannel.roleExtended.replace("%mentions%",mentionMember)
															.replace("%roleName%",roleSearched)
															.replace("%days%",args[1])
															.replace("%endDate%",finalDate)
													)
													.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
												}
											}
										}
									);
								}
								else{
									let dateFormatArr=botConfig.dateFormat.split("/");
									let dateVal01, dateVal02, dateVal03, yr, mo, da;
									
									let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
									let finalDate=((args[1])*(dateMultiplier)); finalDate=((curDate)+(finalDate)); finalDateDisplay.setTime(finalDate);
									
									yr=finalDateDisplay.getFullYear();mo=finalDateDisplay.getMonth()+1;if(mo<10){mo="0"+mo;}da=finalDateDisplay.getDate();if(da<10){da="0"+da;}
									if(dateFormatArr[0]==="mm"){dateVal01=mo;}if(dateFormatArr[0]==="dd"){dateVal01=da;}if(dateFormatArr[0]==="yy"){yr=yr.toString();dateVal01=yr.slice(2);}if(dateFormatArr[0]==="yyyy"){dateVal01=yr;}
									if(dateFormatArr[1]==="mm"){dateVal02=mo;}if(dateFormatArr[1]==="dd"){dateVal02=da;}if(dateFormatArr[1]==="yy"){yr=yr.toString();dateVal02=yr.slice(2);}if(dateFormatArr[1]==="yyyy"){dateVal02=yr;}
									if(dateFormatArr[2]==="mm"){dateVal03=mo;}if(dateFormatArr[2]==="dd"){dateVal03=da;}if(dateFormatArr[2]==="yy"){yr=yr.toString();dateVal03=yr.slice(2);}if(dateFormatArr[2]==="yyyy"){dateVal03=yr;}
									
									finalDateDisplay=dateVal01+"/"+dateVal02+"/"+dateVal03;
									
									myDB.query(`INSERT INTO TempRole_bot.temporaryRoles (userID, userName, temporaryRole, guildID, guildName, startDate, endDate, addedByID, addedByName) VALUES (?,?,?,?,?,?,?,?,?)`, 
										[mentionMember.id, mentionMember.user.username, roleSearched, guild.id, guild.name, curDate, finalDate, member.id, member.user.username],async (error,results)=>{
										if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
									});
									let theirRole=guild.roles.find(role=>role.name===roleSearched);
									mentionMember.addRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
									
									console.log(timeStamp+" "+cc.cyan+mentionMember.user.username+cc.reset+"("+cc.lblue+mentionMember.id+cc.reset
										+") was given a "+cc.green+"temporary"+cc.reset+" role: "+cc.green+roleSearched+cc.reset+", by: "+cc.red+member.user.username+cc.reset+"("+member.id+")");
									
									if(botLanguage){
										if(botLanguage.messageToChannel){
											if(botLanguage.messageToChannel.roleAssigned){
												return channel.send(
													botLanguage.messageToChannel.roleAssigned.replace("%mentions%",mentionMember)
														.replace("%roleName%",roleSearched)
														.replace("%endDate%",finalDateDisplay)
												)
												.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
											}
											else{translation="no"}
										}
										else{translation="no"}
									}
									else{translation="no"}
									if(translation==="no"){
										return channel.send(
											botDefaultLanguage.messageToChannel.roleAssigned.replace("%mentions%",mentionMember)
												.replace("%roleName%",roleSearched)
												.replace("%endDate%",finalDateDisplay)
										)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									}
								}
							}
						});
					}
					else{
						/*
						sqlite.get(`SELECT * FROM temporaryRoles WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${botConfig.serverID}";`)
						.then(row=>{
							if(row){
								let newFinalDate=((args[1])*(dateMultiplier)); newFinalDate=((row.endDate*1)+(newFinalDate*1));
								let endDateVal=new Date(); endDateVal.setTime(newFinalDate);
								let finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
								sqlite.run(`UPDATE temporaryRoles SET endDate=?, reminderSent=? WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${botConfig.serverID}";`,
									[newFinalDate,"no"])
								.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporaryRoles"+cc.reset+" table | "+error.message));
								
								return channel.send("🎉 "+mentionMember+"'s **temporary** role: **"+roleSearched+"** has been extended by **"+args[1]+"** more days. "
									+"They will lose this role on: `"+finalDate+"`");
							}
							else{
								let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
								let finalDate=((args[1])*(dateMultiplier)); finalDate=((curDate)+(finalDate));
								finalDateDisplay.setTime(finalDate); finalDateDisplay=(finalDateDisplay.getMonth()+1)+"/"+finalDateDisplay.getDate()+"/"+finalDateDisplay.getFullYear();
								sqlite.run(`INSERT INTO temporaryRoles (userID, userName, temporaryRole, guildID, guildName, startDate, endDate, addedByID, addedByName) VALUES (?,?,?,?,?,?,?,?,?)`, 
									[mentionMember.id, mentionMember.user.username, roleSearched, guild.id, guild.name, curDate, finalDate, member.id, member.user.username]);
								let theirRole=guild.roles.find(role=>role.name===roleSearched);
								mentionMember.addRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
								console.log(timeStamp+" "+cc.cyan+mentionMember.user.username+cc.reset+"("+cc.lblue+mentionMember.id+cc.reset
									+") was given a "+cc.green+"temporary"+cc.reset+" role: "+cc.green+roleSearched+cc.reset+", by: "+cc.red+member.user.username+cc.reset+"("+member.id+")");
								return channel.send("🎉 "+mentionMember+" has been given a **temporary** role: **"+roleSearched+"**, enjoy! They will lose this role on: `"+finalDateDisplay+"`");
							}
						})
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message)); return;
						*/
					}
				}
			}
		}
	}
};