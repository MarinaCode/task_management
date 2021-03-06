var config = {
    host: 'http://localhost',
    port: '3000',
    secret: "2kYD8O4AVJHlp5aSzX2zUM7iXnIqezgs",
    clients:[{
        email : "admin@admin.com",
        password : "admin",
        role:"superadmin",
        hash: "$2a$10$BGdDW7n89hmVmbgi4sLmOeSAqy7viGLzQxwyOckbmtar19kzpJQau"
    }],
    restApis: {
        users: {
            api_version: 'v1',
            rest_url: function () {
                return '/management/api/' + this.api_version;
            }
        }
    },

    databaseConfiguration: {
        "host": "localhost",
        "user": "root",
        "pass": "",
        "name": "task_management"
    }
};

module.exports = config;