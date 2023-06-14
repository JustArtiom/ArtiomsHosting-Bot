import { EmbedBuilder } from "discord.js";
import { DefaultCommand } from "../../../utils/types";
import validatorCheck from "../../../utils/validatorCheck";
import { userData } from "../../../db";
import { catchHandler } from "../../../utils/console";
import request from "../../../utils/request";

export default <DefaultCommand> {
    name: "list",
    description: "Show a list of your servers",
    run: async (client, interaction) => {
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
            }
        ]);
        if(!user || validation1) return interaction.reply(validation1).catch(catchHandler("Bot"));

        const users_w_servers = await request({
            url: `/api/application/users/${user.pteroid}?include=servers`,
            method: "GET"
        }).catch(() => {})
        
        if(!users_w_servers) return interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(":x: Coudnt fetch panel account")
                .setColor("Red")
            ]
        })

        const servers = users_w_servers?.attributes?.relationships.servers?.data;
        if(!servers.length) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(":x: You have no servers")
                .setColor("Red")
            ]
        })

        let id = 1
        let id2 = 1

        if(servers.length <= 1){
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.user.username}'s servers`)
                    .addFields(
                        {
                            name: 'Server Id:', 
                            value: `\`\`\`\n${servers.map((x: any) => `${id++}. ${x.attributes.identifier}`).join('\n')}\`\`\``, 
                            inline: true
                        },
                        {
                            name: 'Server Name:', 
                            value: `\`\`\`\n${servers.map((x: any) => `${id2++}. ${x.attributes.name}`).join('\n')}\`\`\``, 
                            inline: true
                        }

                    )
                    .setColor("Blue")
                ]
            }).catch(catchHandler("Discord"))
        } else {
            let id = 1
            interaction.reply({
                files:[
                    {
                        attachment: Buffer.from(servers.map((x: any) => `${id++}. ${x.attributes.identifier} ➜ ${x.attributes.name}`).join('\n')),
                        name: "servers.js"
                    }
                ]
            }).catch(catchHandler("Discord"))
        }
        

    }
}