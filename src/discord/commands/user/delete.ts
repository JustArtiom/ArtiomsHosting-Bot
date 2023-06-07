import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import { DefaultCommand } from "../../../utils/types";
import validatorCheck from "../../../utils/validatorCheck";
import { userData } from "../../../db";
import { catchHandler } from "../../../utils/console";
import request from "../../../utils/request";

export default <DefaultCommand> {
    name: "delete",
    description: "Delete your account",
    run: async (client, interaction) => {
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
            }
        ]);
        if(!user || validation1) return interaction.reply(validation1)

        const account_w_servers = await request({
            url: ("/api/application/users/" + user.pteroid + "?include=servers"),
            method: 'GET',
        }).catch(catchHandler("Bot"))

        if(!account_w_servers?.attributes) return interaction.reply({embeds:[
            new EmbedBuilder()
            .setTitle(":x: Account not found")
            .setColor("Red")
        ]}).catch(catchHandler("Bot"))
        
        let servers: {
            id: string, 
            suspended: boolean
        }[] = account_w_servers.attributes.relationships.servers.data.map((x: any) => ({id: x.attributes.id, suspended: x.attributes.suspended}))

        /*
        if(account_w_servers.attributes.relationships.servers.data.find((x: any) => x.attributes.suspended)) return interaction.reply({embeds: [
            new EmbedBuilder()
            .setTitle(":x: Your account cannot be deleted")
            .setColor("Red")
            .setDescription("You have suspended servers with meaning that you will have to contact a staff member in order to delete your account. Thank you")
        ]})
        */

        let msg = await interaction.reply({embeds: [
            new EmbedBuilder()
            .setTitle(`❓ Are you sure you want to delete your own account!`)
            .setColor("Red")
            .setDescription(`You are going to delete your account with username: \`${account_w_servers.attributes.username}\`. Once you click the yes button all your ${servers.length > 1 ? '\`'+ servers.length + '\` servers' : 'servers'} will be deleted.\n\n⚠️ *This acction is not reversable. once you deleted your account all your data will be lost forever*`)
        ], components:[
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
				new ButtonBuilder()
					.setCustomId('DeleteMyAccountConfirmation')
					.setLabel('Yes')
					.setStyle(ButtonStyle.Success),
			)
            .addComponents(
				new ButtonBuilder()
					.setCustomId('CancelAccountDeletion')
					.setLabel('No')
					.setStyle(ButtonStyle.Danger),
			)
        ]})

        const collector = await msg.awaitMessageComponent({ 
            filter: (i) => {
                i.deferUpdate();
                return i.user.id === interaction.user.id
            }, 
            componentType: ComponentType.Button,
            time: 300_000 
        }).catch(catchHandler("Bot"));
        
        if(!collector || collector.customId === "CancelAccountDeletion") return await msg.edit({
            embeds: [
                new EmbedBuilder()
                .setTitle(':x: Account Deletion canceled')
                .setColor("Red")
            ],
            components: []
        })

        if(servers.length) {
            await msg.edit({embeds:[
                new EmbedBuilder()
                .setTitle("⏳ Attempting to delete all your servers")
                .setColor("Yellow")
            ], components: []})
            for (let server of servers) {
                if(server.suspended) await request({
                    url: `/api/application/servers/${server.id}/unsuspend`,
                    method: "POST"
                }).catch(catchHandler("Axios"))

                await request({
                    url: `/api/application/servers/${server.id}/force`,
                    method: "DELETE"
                }).then(() => {
                    servers = servers.filter(x => x.id !== server.id)
                }).catch(catchHandler("Axios"))
            }
        }

        if(servers.length) return await msg.edit({
            embeds: [
                new EmbedBuilder()
                .setTitle(":x: Could not delete all servers")
                .setColor("Red")
                .setDescription("Something went wrong and i couldnt delete all your servers from your account. Please try again, if this error keeps happening please contact and admin.")
            ],
            components: []
        })

        await request({
            url: `/api/application/users/${account_w_servers.attributes.id}`,
            method: "DELETE"
        }).then(() => {
            userData.delete(interaction.user.id)
            msg.edit({
                embeds:[
                    new EmbedBuilder()
                    .setTitle("✅ Account Deleted Successfully")
                    .setColor("Green")
                ]
            })
        })
        .catch((err) => {
            catchHandler("Axios")(err)
            msg.edit({            
                embeds: [
                    new EmbedBuilder()
                    .setTitle(":x: Could not delete your account")
                    .setColor("Red")
                    .setDescription(`An error occoured and i couldnt delete your account. ${err?.response?.data?.errors ? "Error list: \n\n" + err?.response?.data?.errors.map((x: {code: string, status: string, detail: string}) => `**${x.status}** - ${x.detail}`).join('\n') : ""}`)
                ],
                components: []
            })
        })
    }
}