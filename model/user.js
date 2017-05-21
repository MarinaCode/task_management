"use strict";

var Sequelize = require("sequelize");
var bcrypt = require("bcrypt-nodejs");
var defer = require("node-promise").defer;
var config = require('../config/config');

module.exports = function(sequelize, DataTypes) {
    var Users = sequelize.define('Users', {
            user_id: {
                type: Sequelize.INTEGER(11),
                field: 'user_id',
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },

            email: {
                type: Sequelize.STRING(50),
                field: 'email',
                allowNull: false
            },

            password: {
                type: Sequelize.TEXT,
                field: 'password',
                allowNull: true
            },

            firstname: {
                type: Sequelize.STRING(50),
                field: 'firstname',
                allowNull: true
            },

            lastname: {
                type: Sequelize.STRING(50),
                field: 'lastname',
                allowNull: true
            },

            role: {
                type: Sequelize.STRING(50),
                field: 'role',
                allowNull: true
            }
        },
        {
            // don't add the timestamp attributes (updatedAt, createdAt)
            timestamps: false,

            // don't delete database entries but set the newly added attribute deletedAt
            // to the current date (when deletion was done). paranoid will only work if
            // timestamps are enabled
            paranoid: true,

            // don't use camelcase for automatically added attributes but underscore style
            // so updatedAt will be updated_at
            underscored: true,

            // disable the modification of tablenames; By default, sequelize will automatically
            // transform all passed model names (first parameter of define) into plural.
            // if you don't want that, set the following
            freezeTableName: true,

            // define the table's name
            tableName: 'users',

            classMethods: {
                generateHash: function(password) {
                    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                }
            },
            instanceMethods: {
                verifyPassword: function(password) {
                    return bcrypt.compareSync(password, this.password);
                }
            }
    });

    Users.doLogin = function(email, password) {
        var deferred = defer();
        Users.find({
            where: {
                "email": email
            }
        }).then(function(result) {
            if (!result) {
                deferred.reject({error: "User is not found"})
            } else {
                bcrypt.compare(password, result.password, (err, res1) => {
                    if (!res1) {
                        return deferred.reject({error: "Password is incorrect"});
                    } else {
                        return deferred.resolve({result});
                    }
                })
            }
        });
        return deferred.promise;
    }

    Users.createUser = function(email, password, firstName, lastName, role) {
        var deferred = defer();
        var user = {
            email: email,
            firstname: firstName,
            lastname: lastName,
            role: role
        }

        Users.find({
            where: {
                "email": email
            }
        }).then(function(result) {
            if (result) {
                deferred.reject({error: "Email exists"})
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        deferred.reject({error: err});
                    } else {
                        bcrypt.hash(password, salt, null, (err, hash) => {
                            user.password = hash;
                            Users.create(user).then(function(result){
                                deferred.resolve({
                                    user_id: result.user_id,
                                    firstname: result.firstname,
                                    lastname: result.lastname
                                })
                            });
                        })
                    }
                })
            }
        });
        return deferred.promise;
    }

    Users.getAllUsers = function() {
        var deferred = defer();
        Users.findAll({
        }).then(function(result) {
            if(result) {
                deferred.resolve(result);
            }
        })
        return deferred.promise;
    }

    Users.getUserById = function(userId) {
        var deferred = defer();
        Users.find({
            where: {
                user_id: userId
            }
        }).then(function(result) {
            if (result) {
                deferred.resolve({
                    id: result.user_id,
                    role: result.role,
                    firstname: result.firstname,
                    lastname: result.lastname,
                    email: result.email
                });
            } else {
                deferred.reject({error: "User is not found"});
            }
        })
        return deferred.promise;
    }

    Users.deleteUserById = function(userId) {
        var deferred = defer();
        Users.find({
            where: {
                user_id: userId
            }
        }).then(function(result) {
            if (result) {
                Users.destroy({
                    where: {
                        user_id: userId
                    }
                }).then(function(result_) {
                    if (result_) {
                        deferred.resolve({
                            id: result.user_id,
                            role: result.role,
                            firstname: result.firstname,
                            lastname: result.lastname,
                            email: result.email
                        });
                    } else {
                        deferred.reject({error: "User is not found"});
                    }
                })
            } else {
                deferred.reject({error: "User is not found"});
            }
        })
        return deferred.promise;
    }

    Users.updateUserById = function(userId, email, password, firstName, lastName, role) {
        var deferred = defer();
        var user = {
            email: email,
            firstname: firstName,
            lastname: lastName
        }
        if (role) {
            user.role = role;
        }

        Users.find({
            where: {
                user_id: userId
            }
        }).then(result => {
            if (result) {
                Users.find({
                    where: {
                        email: email,
                        "user_id": {$ne: userId}
                    }
                }).then(emailResult => {
                    if (!emailResult) {
                        bcrypt.genSalt(10, (err, salt) => {
                            if (err) {
                                deferred.reject({error: err});
                            } else {
                                bcrypt.hash(password, salt, null, (err, hash) => {
                                    user.password = hash;
                                    Users.update(user, {
                                        where: {
                                            user_id: userId
                                        }
                                    }).then(function (res) {
                                        Users.getUserById(userId).then(function (resultData) {
                                            deferred.resolve({
                                                id: resultData.user_id,
                                                role: resultData.role,
                                                firstname: resultData.firstname,
                                                lastname: resultData.lastname,
                                                email: resultData.email
                                            });
                                        })
                                    })
                                })
                            }
                        })
                    } else {
                        deferred.reject({error: "Email exists"});
                    }
                })
            } else {
                deferred.reject({error: "User is not found"});
            }
        });

        return deferred.promise;
    }
    return Users;
};