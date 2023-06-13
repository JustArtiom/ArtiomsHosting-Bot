export default {
    settings: {
        admins: ["918137699842555964"],
        maintenance: true,
        verifyEmail: true,
        timeout: 3000,
    },
    categories: {
        createAccount: ""
    },
    channels: {},
    roles: {
        beta_testers: "",
        client: ""
    },
    mailer: {
        enabled: true,
        host: "",
        port: 465,
        secure: true,
        auth: {
            user: '',
            pass: ''
        },
        tls: {
            // Enable if you want to avoid SSL/TLS selfsigned certificates
            rejectUnauthorized: false
        }
    },
    bot: {
        guild: "",
        id: "",
        token: ""
    },
    ptero: {
        url: "",
        client: "",
        application: ""
    }
}