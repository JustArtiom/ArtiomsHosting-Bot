import { EmbedBuilder } from "discord.js";
import { userData } from "../../../db";
import { DefaultCommand } from "../../../utils/types";
import validatorCheck from "../../../utils/validatorCheck";
import request from "../../../utils/request";
import { catchHandler } from "../../../utils/console";
import mailer from "../../../mailer";

export default <DefaultCommand> {
    name: "password",
    description: "Reset your account password",
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
        ])

        if(!user || validation1) return interaction.reply(validation1);

        var newPassword = (Math.random() + 1).toString(36).substring(2)

        const fetchedUser = await request({
            url: `/api/application/users/${user.pteroid}`,
            method: "GET"
        }).catch(catchHandler("Axios"))

        if(!fetchedUser?.attributes) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(":x: | Error fetching your ptero account")
                .setColor("Red")
                .setFooter({text: "If you do have an account, panel might be offline"})
            ]
        })

        await request({
            url: `/api/application/users/${user.pteroid}`,
            method: "PATCH",
            data: {
                email: fetchedUser.attributes.email,
                username: fetchedUser.attributes.username,
                first_name: fetchedUser.attributes.first_name,
                last_name: fetchedUser.attributes.last_name,
                password: newPassword
            }
        })

        await interaction.user.send({
            embeds: [
                new EmbedBuilder()
                .setTitle("Account updates")
                .setColor("Blue")
                .setDescription(`
We are reaching out to inform you that there with the password that has been requested to be reset.

**Your new password is:** ||${newPassword}||

To maintain the confidentiality of your account, we recommend that you change this password as soon as possible after logging in. Please remember to create a unique and strong password that is not easily guessable.

If you have any questions or concerns regarding this update, please don't hesitate to contact our support team at \`contact@artiom.host\` or message the company owner. We are here to assist you and provide any necessary guidance.

Thank you for your attention to this matter. We appreciate your cooperation in keeping your account secure.`)
            ]
        })

        await mailer.sendMail({
            from: "no-reply@artiom.host",
            to: fetchedUser.attributes.email,
            subject: `Account password update`,
            text: `
Dear ${fetchedUser.attributes.username},

We hope this message finds you well. We are reaching out to inform you about an important security event regarding your account. It has come to our attention that a recent password change was made for your account.

If you did not authorize this password change, we strongly recommend taking immediate action to secure your account. Here are the steps we suggest you follow:

1. Visit our discord server at https://artiom.host/dsc.
2. Login with your discord account 
2. Run "/user password" initiate the account recovery process.

It is crucial to remember that using unique and strong passwords for all your online accounts significantly enhances your security. We also recommend enabling two-factor authentication (if available) to add an extra layer of protection to your account.

If you believe that this password change was made in error or have any other concerns, please reach out to our support team immediately at contact@artiom.host. We are here to assist you and investigate any potential security issues.

We take the security and privacy of your account seriously, and we apologize for any inconvenience this may have caused. Our team is actively working to ensure the integrity of our systems and prevent any unauthorized access.

Thank you for your prompt attention to this matter. We appreciate your cooperation in keeping your account safe and secure.

Best regards,
ArtiomsHosting` 
        })

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle("Check your email or DMs")
                .setColor("Green")
            ]
        })
    }
}