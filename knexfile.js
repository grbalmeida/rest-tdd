module.exports = {
    test: {
        client: 'mysql',
        connection: {
            host : 'localhost',
            user : 'root',
            password : 'password',
            database : 'finances'
        },
        migrations: {
            directory: 'src/migrations'
        }
    },
};