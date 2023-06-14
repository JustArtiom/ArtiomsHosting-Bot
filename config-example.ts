export default {
    settings: {
        // Discord user ids of person that will have admin perms to this bot
        admins: ["918137699842555964"],
        // Set maintenance mode and allow only users with "beta_testers" role to have access to bot.
        maintenance: true,
        // Send email verification (6pin code) when a user creates an account
        verifyEmail: true,
        // Timeout for any requests to the panel. (high timeout will result in bot not responding to commands sometimes)
        timeout: 3000,
        // Location ids from pterodactyl panel
        locations: {
            // Location ids that have nodes that will host for free
            free: [2],
            // Location ids for people that have special access to special nodes
            premium: [3]
        },
        pricing: {
            cpu: {
                // Price per core
                price: 1.5,
                // [ optional ] Reduce to the price, set 0 to disable
                reduce_to: 1,
                // [ optional ] If buyes more than x cores, set 0 to disable
                if_buy_over: 4
            },
            ram: {
                // Price per GB
                price: 1,
                // [ optional ] Reduce to the price, set 0 to disable
                reduce_to: 0.75,
                // [ optional ] If buyes more than x GB, set 0 to disable
                if_buy_over: 4,
            },
            disk: {
                // Price per GB
                price: 0.2,
                // [ optional ] Reduce to the price, set 0 to disable
                reduce_to: 0.1,
                // [ optional ] If buyes more than x GB, set 0 to disable
                if_buy_over: 15,
            }
        },
        // Auto update from github.
        autoUpdate: {
            // Enable or disable this function
            enabled: true,
            // Github repo link starting with https://github....
            github: "https://gthub.com/JustArtiom/ArtiomsHosting-Bot",
            // Branch where to pull the update from
            branch: "development",
            // Interval to check if there are any updates for the bot
            interval: 30_000
        }
    },
    // Categories ids 
    categories: {
        // Catgory where clients will create accounts
        createAccount: ""
    },
    // Channel ids
    channels: {
        // Channel where to log when the bot does an github update. Leave blank for disabled.
        gitLog: ""
    },
    // Role ids
    roles: {
        // Beta tester role. They will have access to the bot when in maintenance mode
        beta_testers: "",
        // Client role. Leave bank if you dont want your clients to get a client role after creating and account
        client: ""
    },
    mailer: {
        // Enable or disable. You must enable this if you have "verifyEmail" set to true
        enabled: true,
        // SMTP host of the email server. eg: smtp.google.com
        host: "",
        // SMTP port of the email server. eg: 465
        port: 465,
        // Enable or disable use of SSL/TLS
        secure: true,
        // Login form 
        auth: {
            // Email address. eg: no-reply@gmail.com (must be valid)
            user: '',
            // Password of the account
            pass: ''
        },
        // SSL/TLS configuration
        tls: {
            // Enable if you want to avoid SSL/TLS selfsigned certificates
            rejectUnauthorized: false
        }
    },
    // Discord bot configuration
    bot: {
        // Guild id 
        guild: "",
        // Client id
        id: "",
        // Client token
        token: ""
    },
    // Pterodactyl panel configuration
    ptero: {
        // The url of the panel. eg: https://panel.artiom.host
        url: "",
        // The client api token which you can make at {url}/account/api
        client: "",
        // The application api token  which you can make it at {url}/admin/api
        application: ""
    }
}