import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import { DefaultCommand } from "../../../utils/types";
import validatorCheck from "../../../utils/validatorCheck";
import { premiumServers } from "../../../utils/cache/premiumServers";
import { catchHandler } from "../../../utils/console";

export default <DefaultCommand> {
    name: "premium-calculator",
    description: "Calculate the price for your dream server",
    stringOption: [
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
        }
    ],
    run: async (client, interaction) => {
        const cpu = Number(interaction.options.getString("cpu", true));
        const ram = Number(interaction.options.getString("ram", true));
        const disk = Number(interaction.options.getString("disk", true));

        if(!cpu || !ram || !disk) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(":x: The values must be only numbers")
                .setColor("Red")
            ]
        })

        const price = await premiumServers.calculatePrice({
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
                .setTitle("☁️ Your dream server")
                .setDescription(``
                    +`**${cpu} Cores:** \`$${price.cpu}\`\n`
                    +`**${ram}GB Ram:** \`$${price.ram}\`\n`
                    +`**${disk}GB Disk:** \`$${price.disk}\`\n`
                    +`\n`
                    +`**TOTAL:** \`$${price.total}/1 month\` *($${price.hourly.toFixed(6)}/h)*`
                )
                .setColor("Blue")
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Buy now')
                        .setLabel('Yes')
                        .setEmoji("🛒")
                        .setStyle(ButtonStyle.Secondary),
                )
            ]
        })

        const legalCollector = await msg.awaitMessageComponent({ 
            filter: (i) => {
                i.deferUpdate();
                return i.user.id === interaction.user.id
            }, 
            componentType: ComponentType.Button,
            time: 300_000,
        }).catch(() => {});
    }
}