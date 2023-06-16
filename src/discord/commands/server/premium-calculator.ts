import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ComponentType, 
    EmbedBuilder,
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder 
} from "discord.js";
import { DefaultCommand } from "../../../utils/types";
import { premiumServers } from "../../../utils/cache/premiumServers";
import { createPremiumServer } from "./create-premium";
import fs from "node:fs";

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

        if(!cpu || !ram || !disk || [cpu, ram, disk].some(x => x < 0.25) || cpu > 8 || ram > 12 || disk > 50) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(":x: The values you entered for resources are invalid")
                .setColor("Red")
            ]
        })

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

        const button = new ButtonBuilder()
            .setCustomId('buy_server')
            .setLabel('Buy now')
            .setEmoji("🛒")
            .setStyle(ButtonStyle.Secondary);

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
                .addComponents(button)
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

        if(!legalCollector) return msg.edit({
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(button.setDisabled(true))
            ]
        });

        const selectMenuCompenent = new StringSelectMenuBuilder()
        .setCustomId('buy_premium_server_type_menu')
        .setPlaceholder('What server type do you want?')
        .addOptions(
            fs.readdirSync(`${__filename.endsWith(".js") ? "./dist" : "."}/src/server_creation`)
                .map(x => (
                    new StringSelectMenuOptionBuilder()
                    .setLabel(x.slice(0, x.length-3))
                    .setValue(x.slice(0, x.length-3))
                )),
        )

        msg.edit({
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenuCompenent),
            ]
        })

        const menuSelector = await msg.awaitMessageComponent({ 
            filter: (i) => {
                return i.user.id === interaction.user.id
            }, 
            componentType: ComponentType.StringSelect,
            time: 300_000,
        }).catch(() => {});

        msg.edit({
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenuCompenent.setDisabled(true))
            ]
        });
        if(!menuSelector) return 
        
        await createPremiumServer({
            interaction: menuSelector,
            server_type: menuSelector.values[0],
            resources: {
                cpu: cpu * 100, 
                ram: ram * 1024, 
                disk: disk * 1024
            }
        })
    }
}