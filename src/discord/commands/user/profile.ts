import { EmbedBuilder } from "discord.js";
import config from "../../../../config";
import { userData } from "../../../db";
import request from "../../../utils/request";
import { DefaultCommand } from "../../../utils/types";
import { premiumServers } from "../../../utils/cache/premiumServers";

export default <DefaultCommand> {
    name: "profile",
    description: "Display your ArtiomsHosting profile",
    booleanOption: [{
        name: "leak",
        description: "Let other people to see your profile",
        required: false
    }],
    run: async (client, interaction) => {
        const leak = Number(interaction.options.getBoolean("leak"));

        const user = await userData.get(interaction.user.id);
        const servers = !user ? undefined : await request({url: `/api/application/users/${user.pteroid}?include=servers`}).catch(() => undefined)
        .then((x) => x.attributes.relationships.servers.data.map((x: any) => x.attributes))
        .catch(() => {});
        const premium_nodes: any = !servers ? undefined : await new Promise(async (acc) => {
            const nodes: any[] = [];
            for(const location of config.settings.locations.premium) {
                await request({url: `/api/application/locations/${location}?include=nodes`}).then(node => {
                    nodes.push(...node.attributes.relationships.nodes.data.map((x: any) => x.attributes))
                }).catch(() => {})
            }
            acc(nodes)
        })

        const premium_servers = servers.filter((x: any) => premium_nodes.map((y: any) => y.id).includes(x.node))
        const premium_servers_resources = await Promise.all(premium_servers.map((x: any) => request({url: `/api/client/servers/${x.identifier}/resources`}).then((y: any) => ({...y.attributes, identifier: x.identifier, limits: x.limits})).catch(() => {})))

        const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Profile`)
        .addFields({
            name: "**Discord**",
            value: 
            `**ID:** \`${interaction.user.id}\`\n`+
            `**Username:** \`${interaction.user.tag}\`\n`+
            `**Created on:** <t:${~~(interaction.user.createdTimestamp/1000)}> *(<t:${~~(interaction.user.createdTimestamp/1000)}:R>)*\n`+
            (interaction.inCachedGuild() ? `**Joined server:** <t:${~~((interaction.member.joinedTimestamp || 1000) / 1000)}> *(<t:${~~((interaction.member.joinedTimestamp || 1000) / 1000)}:R>)*` : ""),
        })
        .setTimestamp()
        .setColor("Blue")
        .setFooter({text: `© 2022 ArtiomsHosting`})

        if(user) embed.addFields({
            name: "**Account**",
            value: 
            `**ID:** \`${user.pteroid}\`\n`+
            `**Username:** \`${user.username}\`\n`+
            `**Created on:** <t:${~~(user.createdTimestamp/1000)}> *(<t:${~~(user.createdTimestamp/1000)}:R>)*\n`+
            `**Balance:** \`$${user.balance.toFixed(3)}\``
        })

        if(premium_servers?.length && premium_servers_resources?.length) {
            let chargingATM = {
                hourly: 0,
                permonth: 0
            } 

            for(let pserver of premium_servers_resources){
                if(pserver && pserver?.current_state === "running") {
                    const price = premiumServers.calculatePrice({
                        cpu: pserver.limits.cpu,
                        ram: pserver.limits.memory,
                        disk: pserver.limits.disk
                    });
                    chargingATM = {
                        hourly: chargingATM.hourly + price.hourly,
                        permonth: chargingATM.permonth + price.total
                    }
                }
            }
            embed.addFields({
                name: "**Balance usage**",
                value: 
                `**Running:** \`${premium_servers_resources.filter(x => x?.current_state === "running").length}/${premium_servers.length} servers\`\n`+
                `**Chargin ATM:** \`$${chargingATM.permonth.toFixed(2)}/1 month\` *($${chargingATM.hourly.toFixed(5)}/h)*`
            })
        }

        interaction.reply({
            embeds: [
                embed
            ],
            ephemeral: !leak
        })
    }
}