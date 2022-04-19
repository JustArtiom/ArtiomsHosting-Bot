const config = require('../config.json')
module.exports = (client) => {
    const invites = new Map();

    try {
        client.guilds.cache.forEach(async (guild) => {
            const firstInvites = await guild.invites.fetch();
            invites.set(guild.id, new Map(firstInvites.map((invite) => [invite.code, invite.uses])));
        })
        
        
        setInterval(() => {
            client.guilds.cache.forEach(async (guild) => {
                const firstInvites = await guild.invites.fetch();
                invites.set(guild.id, new Map(firstInvites.map((invite) => [invite.code, invite.uses])));
            });
        }, 10000)
    } catch (err) {}
    
    
    
    client.on("inviteDelete", (invite) => {
        invites.get(invite.guild.id).delete(invite.code);
    });
    client.on("inviteCreate", (invite) => {
        invites.get(invite.guild.id).set(invite.code, invite.uses);
    });


    client.on("guildMemberAdd", async (member) => {
        member.roles.add(member.guild.roles.cache.get(config.roleID.member))
        member.guild.invites.fetch().then(async (newInvites) => {
            const oldInvites = invites.get(member.guild.id);
            const invite = newInvites.find(i => i.uses > oldInvites.get(i.code));
            const inviter = client.users.cache.get(invite?.inviter.id);
            const logChannel = member.guild.channels.cache.find(c => c.id === config.channelID.welcome);

            welcometext = [
                `Welcome to ArtiomsHosting`
            ]

            var wtl = Math.floor(Math.random() * welcometext.length);

            if(inviter){
                logChannel.send(`Welcome <@${member.user.id}>, ${welcometext[wtl]}\n(invited by: \`${inviter.tag}\`)`)
                invitedBy.set(member.user.id, {
                    tag: inviter.tag,
                    id: inviter.id
                })

                if(!invinfo.get(inviter.id)){
                    invinfo.set(inviter.id, {
                        invites: 0,
                        regular: 0,
                        left: 0,
                        sold: 0
                    })
                    await invinfo.add(`${inviter.id}.invites`, 1)
                    await invinfo.add(`${inviter.id}.regular`, 1)
                }else{
                    invinfo.add(`${inviter.id}.invites`, 1)
                    invinfo.add(`${inviter.id}.regular`, 1)
                }
            }else{
                logChannel.send(`Welcome <@${member.user.id}>, i couldnt find who invited you :(`);
            }
        });
        client.guilds.cache.forEach(async (guild) => {
            const firstInvites = await guild.invites.fetch();
            invites.set(guild.id, new Map(firstInvites.map((invite) => [invite.code, invite.uses])));
        });
    });
    client.on("guildMemberRemove", async (member) => {
        const logChannel = member.guild.channels.cache.find(c => c.id === config.channelID.bye);
        if(invitedBy.get(member.user.id)){
            logChannel.send(`**${member.user.tag}** left us  ... \ninvited by **${invitedBy.get(member.user.id).tag}**`)
        
            invinfo.add(`${invitedBy.get(member.user.id).id}.left`, 1)
            invinfo.subtract(`${invitedBy.get(member.user.id).id}.invites`, 1)

            await invitedBy.delete(member.user.id)

        }else{
            logChannel.send(`**${member.user.tag}** left us  ... \ni couldnt find who invited him/her`)
        }
        client.guilds.cache.forEach(async (guild) => {
            const firstInvites = await guild.invites.fetch();
            invites.set(guild.id, new Map(firstInvites.map((invite) => [invite.code, invite.uses])));
        });
    })
}