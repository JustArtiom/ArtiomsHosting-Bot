import { DefaultCommand } from "../../utils/types";
import { EmbedBuilder } from "discord.js";
import config from "../../../config";
import { inspect } from "util";

import * as DataBaseImported from "../../db";
import RequestImported from "../../utils/request";
import MailerImported from "../../mailer";
import { premiumServers as premsrvs } from "../../utils/cache/premiumServers";

export default <DefaultCommand> {
    name: 'eval',
    description: 'Bot admins only command',
    stringOption: [{
        name: "eval",
        description: "The JavaScript eval code",
        required: true
    }],
    booleanOption: [{
        name: "async",
        description: "Run the script asynchronous",
    }, {
        name: "silent",
        description: "Show no eval output"
    }],
    run: async (client, interaction) => {
        if(!config.settings.admins.includes(interaction.user.id)) return interaction.reply({embeds: [
            new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setColor(`Red`)
            .setDescription(`Am i fucking bilnd and cant see your discord id in my admin list or you are just not an admin... if youre not an admin, just leave me alone and dont touch this command anymore`)
        ]});

        // For easy use in eval
        const { userData, db } = DataBaseImported;
        const request = RequestImported;
        const mailer = MailerImported;
        const premiumServers = premsrvs;

        const toEval = interaction.options.getString("eval", true);
        const silent = interaction.options.getBoolean("silent")
        const async = interaction.options.getBoolean("async")

        if(!silent && ['token', "leave()"].some(x => toEval.toLowerCase().includes(x))) 
        return interaction.reply({content: `no no no, naughty naughty boy...`, ephemeral: !!silent})

        try{
            let evaled = await eval(async ? `(async () => {${toEval}})()` : toEval)
            if (typeof evaled !== 'string') {
                evaled = inspect(evaled);
            }
            if(!silent && evaled.includes(client.token)) return interaction.reply({content: `no no no, naughty naughty boy... u want my token???`, ephemeral: !!silent})

            if(evaled.length < 3975){
                interaction.reply({embeds: [
                    new EmbedBuilder()
                    .setTitle(`Eval by ${interaction.user.tag}`)
                    .setColor(`Orange`)
                    .setDescription(`\`\`\`js\n${evaled}\`\`\``)
                ], ephemeral: !!silent})
            }else{
                interaction.reply({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`Eval by ${interaction.user.tag}`)
                    	.setColor(`Orange`)
                    ],
                    files:[
                        {
                            attachment: Buffer.from(evaled),
                            name: "eval.js"
                        }
                    ],
                    ephemeral: !!silent
                })
            }

        }catch(err){
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`:x: | Error`)
                    .setColor(`Red`)
                    .setDescription(`${err}`)
                ]
            })
        }
    }
}