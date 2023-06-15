import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import { DefaultCommand } from "../../../utils/types";
import { userData } from "../../../db";
import validatorCheck from "../../../utils/validatorCheck";
import { catchHandler } from "../../../utils/console";
import request from "../../../utils/request";
import config from "../../../../config";
import { premiumServers } from "../../../utils/cache/premiumServers";

export default <DefaultCommand> {
    name: "delete",
    description: "Delete a server",
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
                    const user_servers = await request({url: `/api/application/users/${user?.pteroid}?include=servers`, method: "GET"}).catch(catchHandler("Axios"));
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
                        .setDescription("This server is suspended which means that you had violated our terms of service. Before deleting the server and hiding the evidence we will have to inspect it, so currently you wont be able to delete this server. Wait for an admin to delete it.")
                        .setColor("Red")
                    ]
                }
            }
        ]);
        if(!user || validation1) return interaction.reply(validation1).catch(catchHandler("Bot"));

        let msg = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`❓ Are you sure you want to delete this server!`)
                .setColor("Red")
                .setDescription(`You are going to delete the next server: 
                
                > **Name:** ${serverdata.attributes.name}
                > **Identifier:** ${serverdata.attributes.identifier}
                > **Created on:** <t:${new Date(serverdata.attributes.created_at).getTime() / 1000}:f> *(<t:${new Date(serverdata.attributes.created_at).getTime() / 1000}:R>)*
                `)
            ], components:[
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('DeleteServer')
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Success),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('DontDeleteServer')
                        .setLabel('No')
                        .setStyle(ButtonStyle.Danger),
                )
            ], ephemeral: true
        })

        const collector = await msg.awaitMessageComponent({ 
            filter: (i) => {
                i.deferUpdate();
                return i.user.id === interaction.user.id
            }, 
            componentType: ComponentType.Button,
            time: 300_000 
        }).catch(catchHandler("Discord"));
        
        if(!collector || collector.customId === "DontDeleteServer") return await msg.edit({
            embeds: [
                new EmbedBuilder()
                .setTitle(':x: Server Deletion canceled')
                .setColor("Red")
            ],
            components: []
        })

        const node = await request({
            url: `/api/application/nodes/${serverdata.attributes.node}`,
            method: "GET"
        }).catch(() => {})

        await request({
            url: `/api/application/servers/${serverdata.attributes.id}/force`,
            method: "DELETE"
        }).then(() => {
            if(node && config.settings.locations.premium.includes(node?.attributes?.location_id)) {
                premiumServers.cache.delete(serverdata.attributes.identifier)
            }
            interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                    .setTitle("✅ Server deleted successfully")
                    .setColor("Green")
                ]
            })
        }).catch((err) => {
            interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                    .setTitle("❌ Couldnt delete your server")
                    .setDescription(`Somthing went wrong and i couldnt delete your server. ${
                        err?.response?.data?.errors?.length ? 
                        `\n\n**Error Log:**\n ${err?.response?.data?.errors.map((x: any) => `**${x.status}** - ${x.detail}`)}` : 
                        ""
                    }`)
                ]
            })
        })
    }
}