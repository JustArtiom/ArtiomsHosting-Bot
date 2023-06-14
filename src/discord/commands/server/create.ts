import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonInteraction, 
    ButtonStyle, 
    CacheType, 
    ComponentType, 
    EmbedBuilder 
} from "discord.js";
import { DefaultCommand } from "../../../utils/types";
import fs from "node:fs";
import { userData } from "../../../db";
import validatorCheck from "../../../utils/validatorCheck";
import { catchHandler } from "../../../utils/console";
import request from "../../../utils/request";
import config from "../../../../config";

export default <DefaultCommand> {
    name: "create",
    description: "Create a server",
    stringOption: [
        {
            name: "type",
            description: "Server type",
            required: true,
            choices: fs.readdirSync(`${__filename.endsWith(".js") ? "./dist" : "."}/src/server_creation`)
                .map(x => ({name: x.slice(0, x.length-3), value: x.slice(0, x.length-3)}))
        },
        {
            name: "name",
            description: "Server name",
        }
    ],
    run: async (client, interaction) => {
        const server_type = interaction.options.getString("type", true);
        const server_name = interaction.options.getString("name");

        const user = await userData.get(interaction.user.id) 
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
                callback: async () => !fs.readdirSync(`${__filename.endsWith(".js") ? "./dist" : "."}/src/server_creation`)
                .map(x => x.slice(0, x.length-3)).includes(server_type),
                interaction: {
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(":x: This server type is not available")
                        .setColor("Red")
                    ]
                }
            }
        ]);
        if(!user || validation1) return interaction.reply(validation1).catch(catchHandler("Bot"));

        const account_w_servers = await request({
            url: ("/api/application/users/" + user.pteroid + "?include=servers"),
            method: 'GET',
        }).catch(catchHandler("Axios"));

        if(!account_w_servers?.attributes) return interaction.reply({embeds:[
            new EmbedBuilder()
            .setTitle(":x: Couldnt fetch your server list")
            .setColor("Red")
        ]}).catch(catchHandler("Bot"))
        let servers = account_w_servers.attributes.relationships.servers.data;

        let buttoninteraction: ButtonInteraction<CacheType> | void | undefined;
        if(servers.length >= 5) {
            const msg = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle("❓ Are you sure you want to create more servers?")
                    .setDescription("Remember, abusing the host is contra our terms of service. If the servers are unused for more than 1 month, it will give you a warning by email that if no action will happen on the server, it will get deleted")
                    .setColor("Red")
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('CreateAnotherServer')
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('DontCreateAnotherServer')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger),
                    )
                ]
            })

            buttoninteraction = await msg.awaitMessageComponent({ 
                filter: (i) => i.user.id === interaction.user.id, 
                componentType: ComponentType.Button,
                time: 300_000 
            }).catch(() => {});

            if(buttoninteraction?.customId === "DontCreateAnotherServer") {
                buttoninteraction.deferUpdate();
                msg.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle("Thanks for understanding us")
                        .setColor("Green")
                    ],
                    components: []
                }).catch(catchHandler("Discord"))
                return
            }
        }

        let server_config = await import(`../../../server_creation/${server_type}`)
        if(!server_config) return (buttoninteraction || interaction).reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(":x: Server configuration file was not found")
                .setColor("Red")
            ]
        }).catch(catchHandler("Discord"));

        request({
            url: "/api/application/servers",
            method: "POST",
            data: server_config.default(user.pteroid, server_name || server_type+" server", config.settings.locations.free)
        }).then((res) => {
            (buttoninteraction || interaction).reply({
                content: undefined,
                embeds: [
                    new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(`✅ Server Created Successfully`)
                    .setDescription(`
                    > **Status:** \`${res.attributes.status}\`
                    > **User ID:** \`${user.pteroid}\`
                    > **Server Name:** \`${server_name || server_type+" server"}\`
                    > **Server Type:** \`${server_type}\`
                    `)
                ], components: [
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Link')
                        .setURL(`${config.ptero.url}/server/${res.attributes.identifier}`)
                        .setStyle(ButtonStyle.Link)
                    )
                ]
            })
        }).catch((err) => {
            (buttoninteraction || interaction).reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle("❌ Server creation failed")
                    .setColor("Blue")
                    .setDescription(`Somthing went wrong and i couldnt create your server. ${
                        err?.response?.data?.errors?.length ? 
                        `\n\n**Error Log:**\n ${err?.response?.data?.errors.map((x: any) => `**${x.status}** - ${x.detail}`)}` : 
                        ""
                    }`)
                ]
            })
        })
    }
}