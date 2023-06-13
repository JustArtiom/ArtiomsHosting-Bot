# ⚠️ Project in development
Please do not create any pull requests or issues related to the code unless the command is marked as completed. Any issues related to this project must be reported by:
- Discord: Artiom#0001
- Discord server: [Click Here](https://discord.gg/BVYHASDrBJ)
- Email: artiomsiatat@gmail.com

# 🤖 ArtiomsHosting-Bot 2.0
ArtiomsHosting Bot is a discord bot relying on [discord.js](https://discord.js.org/) package. The discord bot purpose is to maintain ArtiomsHosting services allowing users to manage their accounts and servers. The bot is also capable of showing stats of nodes in realtime with an embed updating in a interval of time.

### Features
- Allow users to manage their account
- Allow users to manage their servers
- Show realtime status of the servers
- API backend allowing third parties to contribute
- Debugging and analysing tools 
- AutoUpdate from github. keep your bot up to date

# ⚙️ Environment setup
> To ensure compliance with copyright laws, it is crucial to thoroughly understand and carefully review the License before utilizing the source code.
1. Download [node.js](https://nodejs.org/en/download)
2. Download the source code
3. Setup **config.ts**
3. Install the packages: `npm install`
4. Deploy the commands: `npm run deploy`
5. Start the bot: `npm start`

# 📬 AutoUpdate from github
AutoUpdate feature is a feature that allows automatic update from a github repo when changes are made. It can be found in config-example.ts on setting.autoUpdate. once enabled you can keep it by default if you want to update the bot from my repo, or convigure your repo.

### [Required] Git configuration.
```sh
git init
git remote add origin <repo_url>
git checkout <branch_name>
```
