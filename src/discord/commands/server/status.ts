import { DefaultCommand } from "../../../utils/types";
import validatorCheck from "../../../utils/validatorCheck";
import request from "../../../utils/request";
import { userData } from "../../../db";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { catchHandler } from "../../../utils/console";
import config from "../../../../config";
import { convertBytes, convertMsToDHM } from "../../../utils/formatDate";
import { setTimeout as wait } from "node:timers/promises"
import { premiumServers } from "../../../utils/cache/premiumServers";
export default <DefaultCommand> {
    name: "status",
    description: "Show and manage a server status",
    stringOption: [
        {
            name: "id",
            description: "Server identifier",
            required: true
        }
    ],
    run: async (client, interaction) => {
        const server_identifier = interaction.options.getString("id", true);

        const user = await userData.get(interaction.user.id);
        let serverdata: any;

        let validation1 = await validatorCheck([
            {
                callback: async () => !user,
                interaction: {
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(":x: | You dont have an account")
                        .setColor("Red")
                    ]
                }
            }, 
            {
                callback: async () => {
                    const user_servers = await request({url: `/api/application/users/${user?.pteroid}?include=servers`, method: "GET"}).catch(() => {});
                    serverdata = user_servers?.attributes?.relationships?.servers?.data?.find((x: any) => x.attributes.identifier === server_identifier)
                    return !serverdata
                },
                interaction: {
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(":x: Cannot find this server")
                        .setColor("Red")
                    ]
                }
            }, 
            {
                callback: async () => serverdata.attributes.suspended,
                interaction: {
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(":x: This server is suspended")
                        .setColor("Red")
                    ]
                }
            }
        ]);
        if(!user || validation1) return interaction.reply(validation1).catch(catchHandler("Bot"));

        const resources = await request({url: `/api/client/servers/${serverdata.attributes.identifier}/resources`}).catch(() => {})
        if(!resources) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(":x: Couldnt fetch server resources")
                .setColor("Red")
            ]
        });

        const dhm = convertMsToDHM(resources.attributes.resources.uptime);
        const price = premiumServers.calculatePrice({
            cpu: serverdata.attributes.limits.cpu,
            ram: serverdata.attributes.limits.memory,
            disk: serverdata.attributes.limits.disk
        });
        const node = await request({
            url: `/api/application/nodes/${serverdata.attributes.node}`,
            method: "GET"
        }).catch(() => {})

        const msg = await interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`Your Server Status`)
                .setColor(`${resources.attributes.current_state == 'running' ? 'Green' : resources.attributes.current_state == 'offline' ? 'Red' : "Yellow"}`)
                .setDescription(`**Status:** \`${resources.attributes.current_state == 'running' ? '🟢 Running' : resources.attributes.current_state == 'offline' ? '🔴 Offline' : "🔄" + resources.attributes.current_state}\`\n`
                + `**Name:** \`${serverdata.attributes.name}\`\n`
                + `**Uptime:** \`${resources.attributes.resources.uptime ? `${dhm.days === 0 ? "" : dhm.days+"d "}${dhm.hours === 0 ? "" : dhm.hours+"h "}${dhm.minutes === 0 ? "" : dhm.minutes+"m "}${dhm.seconds}s` : "Offline"}\`\n`
                + `**Cpu:** \`${resources.attributes.resources.cpu_absolute}%\`\n`
                + `**Ram:** \`${convertBytes(resources.attributes.resources.memory_bytes)}\`\n`
                + `**Disk:** \`${convertBytes(resources.attributes.resources.disk_bytes)}\`\n`
                + `**Net:** \`⬆️${convertBytes(resources.attributes.resources.network_tx_bytes)}/${convertBytes(resources.attributes.resources.network_rx_bytes)}⬇️\`\n`
                + `**Full Id:** \`${serverdata.attributes.uuid}\`\n`
                + (
                    (node && config.settings.locations.premium.includes(node?.attributes?.location_id)) ? 
                    `\n👑 __**Premium server**__\n**Price**: \`$${price.total}/1 month\` *($${price.hourly.toFixed(6)}/h)*`
                    : ""
                )
                )
            ], components:[
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('start')
                    .setLabel('🟢 Start')
                    .setStyle(ButtonStyle.Success),
                )
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('restart')
                    .setLabel('🔄 Restart')
                    .setStyle(ButtonStyle.Primary),
                )
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('🔴 Stop')
                    .setStyle(ButtonStyle.Danger),
                )
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('🔗 Link')
                    .setURL(`${config.ptero.url}/server/${serverdata.attributes.identifier}`)
                    .setStyle(ButtonStyle.Link),
                )
            ]
        });
        
        const collector = msg.createMessageComponentCollector({filter: (i) => interaction.user.id === i.user.id, max: 5, time: 20_000});
        
        collector.on('collect', async i => {
            if(i.customId === "start") {
                request({
                    url: `/api/client/servers/${serverdata.attributes.identifier}/power`,
                    method: "POST",
                    data: { signal: "start" }
                }).catch(() => {});
                i.reply(`✅ | Server succssufuly started`);
            }
            if(i.customId === "restart") {
                await request({
                    url: `/api/client/servers/${serverdata.attributes.identifier}/power`,
                    method: "POST",
                    data: { signal: "kill" }
                }).catch(() => {});
                await wait(500);
                request({
                    url: `/api/client/servers/${serverdata.attributes.identifier}/power`,
                    method: "POST",
                    data: { signal: "restart" }
                }).catch(() => {});;
                i.reply(`🔄 | Server succssufuly restarted`);
            }
            if(i.customId === "stop") {
                request({
                    url: `/api/client/servers/${serverdata.attributes.identifier}/power`,
                    method: "POST",
                    data: { signal: "kill" }
                }).catch(() => {});
                i.reply(`🔴 | Server succssufuly stopped`)
            }
        })

        collector.on('end', () => {
            msg.edit({
                components:[
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('start')
                        .setLabel('🟢 Start')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    )
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('restart')
                        .setLabel('🔄 Restart')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    )
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('stop')
                        .setLabel('🔴 Stop')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    )
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('🔗 Link')
                        .setURL(`${config.ptero.url}/server/${serverdata.attributes.identifier}`)
                        .setStyle(ButtonStyle.Link),
                    )
                ]
            })
        })
    }
}