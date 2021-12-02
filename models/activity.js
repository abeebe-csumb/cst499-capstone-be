'use sctrict';
const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    var Activity = sequelize.define('Activity', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        type: {
            allowNull: false,
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    });
    return Activity;
}