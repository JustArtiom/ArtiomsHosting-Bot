import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    ComponentType, 
    EmbedBuilder, 
} from "discord.js";
import { DefaultCommand } from "../../../utils/types";
import config from "../../../../config";
import { userData } from "../../../db";
import { setTimeout as wait } from 'node:timers/promises';
import { catchHandler } from "../../../utils/console";
import validatorCheck from "../../../utils/validatorCheck";
import collectorHandler, { toCollectParam } from "../../../utils/collectorHandler";
import validator from "validator";
import mailer from "../../../mailer";
import request from "../../../utils/request";

const timedelay = new Map<number, string>()
const sessions = new Map<string, string>()

export default <DefaultCommand> {
    name: "new",
    description: "Create an account on ArtiomsHosting",
    run: async (client, interaction) => {

        let validation1 = await validatorCheck([
            {
                callback: async () => !!await userData.get(interaction.user.id),
                interaction: {
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(":x: | You already have an account")
                        .setColor("Red")
                    ]
                }
            },
            {
                callback: () => client.channels.cache.get(config.categories.createAccount)?.type !== ChannelType.GuildCategory,
                interaction: {
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(":x: | Category not found")
                        .setColor("Red")
                        .setDescription("The category for creating a private channel to complete the account registration was not found in the cache. The reasons for this might be because the cache was loaded wrongly or the channel id set in the config is not available/valid. Please contact an admin!")
                    ]
                }
            }, 
            {
                callback: () => Array.from(timedelay.values()).filter(value => value === interaction.user.id).length >= 3,
                interaction: {
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(":x: | You tried too many times")
                        .setColor("Red")
                        .setDescription(`We apologise, but it seems that you have tried to create your account for too many times. For security purposes we will have to temporarily restrict you from this feature. Please try again later.`)
                    ]
                }
            }
        ])

        if(validation1) return interaction.reply(validation1)

        let channel = await interaction.guild?.channels.create({
            name: interaction.user.id,
            parent: config.categories.createAccount,
            permissionOverwrites: [{
                id: interaction.user.id,
                allow: ["ViewChannel", "ReadMessageHistory"],
            }, {
                id: interaction.guild.id,
                deny: ["ViewChannel", "SendMessages"]
            }]
        }).catch((e) => {
            catchHandler("Discord")(e)
            console.log(e)
        })

        if(!channel) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(":x: | Channel creation error")
                .setColor("Red")
                .setDescription("An error occurred and the private channel wasnt created. There could be many reasons for this happening, some of them beeing: interaction.guild is undefined or there has been an API request error. Check console for more info!")
            ]
        })

        await interaction.reply(`Please check ${channel} to create your account!`)

        let msg = await channel.send({
            content: `${interaction.user}`,
            embeds: [
                new EmbedBuilder()
                .setTitle(`Welcome to ArtiomsHosting`)
                .setColor(`Blue`)
                .setDescription(``
                + `Hello **${interaction.user.username}**,\n`
                + `\n`                
                + `Before creating your account, you will need to agree to our terms of service and privacy policy. These policies outline the rules and regulations that govern your use of our services and the ways in which we collect, use, and protect your personal information.\n`
                + `\n`
                + `By agreeing to our terms of service and privacy policy, you are acknowledging that you understand and accept the terms outlined in these documents. If you do not agree to these terms, unfortunately, you will not be able to create an account with us.\n`
                + `\n`
                + `**So, do you accept our privacy policy and terms of service?**`
                )
                .setFooter({text: "This Interaction collector will expire in 5 minutes"})
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("acceptLegal")
                        .setLabel("Accept")
                        .setStyle(ButtonStyle.Success)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("rejectLegal")
                        .setLabel("Reject")
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        })

        const legalCollector = await msg.awaitMessageComponent({ 
            filter: (i) => {
                i.deferUpdate();
                return i.user.id === interaction.user.id
            }, 
            componentType: ComponentType.Button,
            time: 300_000 
        }).catch(catchHandler("Discord"));

        if(!legalCollector || legalCollector.customId !== "acceptLegal") {
            await msg.edit({
                content: `${interaction.user}`,
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Oh, we are sorry :(`)
                    .setColor(`Red`)
                    .setDescription(``
                    + `Bt rejecting our terms of service and privacy policy, we regret to inform you that you will not be able to create an account with us.\n`
                    + `\n`
                    + `We understand that you may have concerns or questions about our policies, and we encourage you to review them thoroughly before making a decision. If you have any questions or feedback about our terms of service or privacy policy, please do not hesitate to reach out to us.\n`
                    + `\n`
                    + `Please note that by creating an account with us, you agree to abide by our policies and regulations. We take the protection of your personal information seriously and are committed to providing you with a secure and positive user experience.\n`
                    + `\n`
                    + `**Thank you for considering our policies and for your interest in our services.**`
                    )
                    .setFooter({text: `This channel will be deleted in 30 seconds`})
                ],
                components: []
            })
            await wait(30_000);
            channel.delete().catch(() => msg.edit({
                content: null, 
                embeds: [
                    new EmbedBuilder()
                    .setTitle(":x: | Could not delete channel")
                    .setColor("Red")
                    .setDescription("This channel couldnt be deleted. Please ask an admin to delete this channel.")
                ], 
                components: []
            })).catch(catchHandler("Discord"));
            return
        }

        if(sessions.get(interaction.user.id)) {
            await msg.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(":x: Ooppsss")
                    .setColor("Red")
                    .setDescription("It appears that you are already in a session trying to create an account. Please go to the right channel to complete your account creation")
                    .setFooter({text: "This channel will be deleted in 10 seconds"})
                ],
                components: []
            })
            await wait(10_000)
            channel.delete().catch(catchHandler("Discord"))
            return 
        }
        sessions.set(interaction.user.id, channel.id);

        await channel.permissionOverwrites.edit(interaction.user, {
            SendMessages: true
        }).catch((e) => {
            catchHandler("Bot")(e);
            msg.edit(e).catch(catchHandler("Discord"))
        })

        const toCollect: toCollectParam[] = [
            {
                id: "username",
                ask: "What should be your username?",
                validation: async (message) => {
                    if(/^[A-Za-z0-9]*$/.test(message.content)) return { error: false, message: message.content.toLowerCase().trim() }
                    return {error: true, message: "The username must not have special characters. A-Za-z0-9"}
                }
            }, {
                id: "email",
                ask: "What is your email?",
                validation: async (message) => {
                    if(validator.isEmail(message.content)) return { error: false, message: message.content.toLowerCase().trim() }
                    return {error: true, message: "The email address must be valid"}
                }
            }
        ]

        if(config.mail.enabled && config.settings.verifyEmail) {
            const pin6 = Math.floor(100000 + Math.random() * 900000)
            toCollect.push({
                id: "pin6",
                ask: "What is the 6 pin code?",
                description: "We kindly request you to check your email for the 6-digit PIN code. It should have been sent to the email address given by you earlier. Please take a moment to review your inbox, including any spam or junk folders, as the email might have been filtered there. Thank you for your cooperation in completing the verification process.",
                tries: 5,
                validation: async (message) => {
                    if(message.content === pin6.toString()) return { error: false, message: message.content }
                    return { error: true, message: "The pin code is incorrect." }
                },
                run: async (collectedData) => {
                    let mail = await mailer.sendMail({
                        from: config.mail.auth.user, 
                        to: collectedData.find(x => x.id === "email")?.data, 
                        subject: `${pin6} - Here is your 6pin code`, 
                        text: `Thank you for regestiring at ArtiomsHosting. Your 6pin verification code is: ${pin6}\n\nThanks and have a nice day!\nArtiomsHosting`, 
                    }).catch((err) => {
                        catchHandler("Mail")(err)
                        console.log(err)
                        channel?.send({embeds: [
                            new EmbedBuilder()
                            .setTitle("Error Sending the email")
                            .setColor("Red")
                        ]})
                    })

                    if(!mail) return
                    const time = Date.now()
                    timedelay.set(time, interaction.user.id)
                    wait(3_600_000).then(() => {
                        timedelay.delete(time)
                    })
                }
            })
        }

        const collected = await collectorHandler({
            filter: (message) => message.author.id === interaction.user.id,
            message: msg,
            toCollect: toCollect
        })

        if(!Array.isArray(collected)) {
            sessions.delete(interaction.user.id)
            await channel.send({embeds: [
                new EmbedBuilder()
                .setTitle(collected.message)
                .setColor("Red")
                .setFooter({text: "This channel will be deleted in 10 seconds"})
            ]}).catch(catchHandler("Discord"))
            await wait(10_000)
            channel.delete().catch(catchHandler("Discord"))
            return
        }

        const userCreds = {
            username: collected.find((x) => x.id === "username")?.data,
            email: collected.find((x) => x.id === "email")?.data,
            pin6: collected.find((x) => x.id === "pin6")?.data,
            password: (Math.random() + 1).toString(36).substring(2)
        }

        const res = await request({
            url: "/api/application/users",
            method: "POST",
            data: {
                username: userCreds.username,
                email: userCreds.email,
                first_name: userCreds.username,
                last_name: "client",
                password: userCreds.password,
                root_admin: false,
                language: "en",
            }
        }).catch(x => ({error: true, data: x?.response?.data?.errors}))

        sessions.delete(interaction.user.id)
        if(res.error) {
            await msg.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(":x: Error creating the account")
                    .setColor("Red")
                    .setDescription(res.data ? 
                        `We have some issues creating your account:\n\n ${res.data.map((x: {code: string, status: string, detail: string}) => `**${x.status}** - ${x.detail}`).join('\n')}` : 
                        `The server might be offline at the moment. Please try again later.`)
                    .setFooter({text: "This channel will be deleted in 10 seconds"})
                ]
            })
            await wait(10_000)
            channel.delete().catch(catchHandler("Discord"))
            return
        }

        await userData.set(interaction.user.id, {
            discordid: interaction.user.id,
            pteroid: res.attributes.id,
            username: res.attributes.username,
            email: res.attributes.email,
            pin6: userCreds.pin6,
            balance: 2,
            createdTimestamp: Date.now(),
        })

        msg.member?.roles.add(config.roles.client).catch(catchHandler("Discord"))
        msg.edit({
            content: `${msg.author}`,
            embeds: [
                new EmbedBuilder()
                .setTitle(`✅ Your account was successfully created`)
                .setColor(`Blue`)
                .setDescription(`Here are the account details:\n\n> panel link: ${config.ptero.url}\n> email: \`${userCreds.email}\`\n> username: \`${userCreds.username}\`\n> password: || ${userCreds.password} ||\n\nMake sure you will change your password *(after you login)* by accessing the top right account icon on the panel, from there you will have to type your curent password which is marked above and your new password.\n\n⚠️ *This channel will be deleted in 30 minues, make sure you saved your login data before the channel gets deleted*`)
            ]
        }).catch(catchHandler("Discord"))

        await wait(1_800_000)
        try{ channel.delete().catch(() => {}) }catch(err){ msg.channel.send(`There was an error deleting the channel!\n${err}`).catch(catchHandler("Bot"))}
    }
}