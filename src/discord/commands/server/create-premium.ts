import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonInteraction, 
    ButtonStyle, 
    ChatInputCommandInteraction, 
    ComponentType, 
    EmbedBuilder, 
    StringSelectMenuInteraction 
} from "discord.js";
import { DefaultCommand } from "../../../utils/types";
import validatorCheck from "../../../utils/validatorCheck";
import { premiumServers } from "../../../utils/cache/premiumServers";
import fs from "node:fs";
import { userData } from "../../../db";
import { catchHandler } from "../../../utils/console";
import request from "../../../utils/request";
import config from "../../../../config";

export default <DefaultCommand> {
    name: "create-premium",
    description: "Create a premium server",
    stringOption: [
        {
            name: "type",
            description: "Server type",
            required: true,
            choices: fs.readdirSync(`${__filename.endsWith(".js") ? "./dist" : "."}/src/server_creation`)
                .map(x => ({name: x.slice(0, x.length-3), value: x.slice(0, x.length-3)}))
        },
        {
            name: "cpu",
            description: "How many cores do you want the server to have",
            required: true
        },
        {
            name: "ram",
            description: "How much RAM in GB do you want your server to have",
            required: true
        },
        {
            name: "disk",
            description: "How much DISK in GB do you want your server to have",
            required: true
        },
        {
            name: "name",
            description: "Server name",
        }
    ],
    run: async (client, interaction) => {
        const type = interaction.options.getString("type", true);
        const cpu = Number(interaction.options.getString("cpu", true));
        const ram = Number(interaction.options.getString("ram", true));
        const disk = Number(interaction.options.getString("disk", true));
        const name = interaction.options.getString("name") || undefined;

        const user = await userData.get(interaction.user.id);
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
            }, {
                callback: async () => (user?.balance || 0) <= 0,
                interaction: {
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(":x: Your account balance is too low")
                        .setColor("Red")
                    ]
                }
            }, {
                callback: async () => !cpu || !ram || !disk || [cpu, ram, disk].some(x => x < 0.25) || cpu > 8 || ram > 12 || disk > 50,
                interaction: {
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(":x: The values you entered for resources are invalid")
                        .setColor("Red")
                    ]
                }
            }
        ]);

        if(!user || validation1) 
            return interaction.reply(validation1).catch(catchHandler("Bot"));

        const price = premiumServers.calculatePrice({
            cpu: cpu * 100, 
            ram: ram * 1024, 
            disk: disk * 1024
        })

        if(!price) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(":x: Couldnt calculate the price")
                .setColor("Red")
            ]
        })

        const msg = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle("❓ Are you sure everything is right?")
                .setColor("Blue")
                .setDescription(``
                +`**Server type:** \`${type}\`\n`
                +`**${cpu} Cores:** \`$${price.cpu}\`\n`
                +`**${ram}GB Ram:** \`$${price.ram}\`\n`
                +`**${disk}GB Disk:** \`$${price.disk}\`\n`
                +`\n`
                +`**TOTAL:** \`$${price.total}/1 month\` *($${price.hourly.toFixed(6)}/h)*`)
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_prem_serv')
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Success),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('dont_create_prem_serv')
                        .setLabel('No')
                        .setStyle(ButtonStyle.Danger),
                )
            ]
        })

        const interactionCollected = await msg.awaitMessageComponent({ 
            filter: (i) => i.user.id === interaction.user.id, 
            componentType: ComponentType.Button,
            time: 300_000 
        }).catch(() => {});

        if(!interactionCollected || interactionCollected.customId === "dont_create_prem_serv") {
            msg.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle("Premium server creation canceled")
                    .setColor("Red")
                ],
                components: []
            })
            return
        }

        await createPremiumServer({
            interaction: interactionCollected,
            server_type: type,
            server_name: name,
            resources: {
                cpu: cpu * 100,
                ram: ram * 1024,
                disk: disk * 1024
            }
        })
    }
}

export const createPremiumServer = async ({
    interaction, 
    resources,
    server_type,
    server_name
}: {
    interaction: ChatInputCommandInteraction | StringSelectMenuInteraction | ButtonInteraction, 
    resources: {cpu: number, ram: number, disk: number},
    server_type: string,
    server_name?: string,
}) => {
    const user = await userData.get(interaction.user.id);
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
        }, 
        {
            callback: async () => (user?.balance || 0) <= 0,
            interaction: {
                embeds: [
                    new EmbedBuilder()
                    .setTitle(":x: Your account balance is too low")
                    .setColor("Red")
                ]
            }
        }
    ]);

    if(!user || validation1) 
        return interaction.reply(validation1).catch(catchHandler("Bot"));

    let server_config = await import(`../../../server_creation/${server_type}`)
    if(!server_config) return interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle(":x: Server configuration file was not found")
            .setColor("Red")
        ]
    }).catch(catchHandler("Discord"));

    await request({
        url: "/api/application/servers",
        method: "POST",
        data: server_config.default(user.pteroid, server_name || server_type+" server [ Premium ]", config.settings.locations.premium, resources)
    }).then(async (i) => {
        const price = premiumServers.calculatePrice(resources);
        premiumServers.cache.set(i.attributes.identifier,  i.attributes);
        await interaction.reply({
            content: undefined,
            embeds: [
                new EmbedBuilder()
                .setColor("Green")
                .setTitle(`💰 Premium Server Created Successfully`)
                .setDescription(`
                > **Status:** \`${i.attributes.status}\`
                > **User ID:** \`${user.pteroid}\`
                > **Server Name:** \`${server_name || server_type+" server [ Premium ]"}\`
                > **Server Type:** \`Premium - ${server_type}\`
                `)
                .setFooter({text: `$${price?.hourly.toFixed(6)} will be taken hourly when your server will be online`})
            ], components: [
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Link')
                    .setURL(`${config.ptero.url}/server/${i.attributes.identifier}`)
                    .setStyle(ButtonStyle.Link)
                )
            ]
        })
        premiumServers.monitorCharges();
    }).catch((err) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle("❌ Server creation failed")
                .setColor("Red")
                .setDescription(`Somthing went wrong and i couldnt create your server. ${
                    err?.response?.data?.errors?.length ? 
                    `\n\n**Error Log:**\n ${err?.response?.data?.errors.map((x: any) => `**${x.status}** - ${x.detail}`)}` : 
                    ""
                }`)
            ]
        })
    })

    
}