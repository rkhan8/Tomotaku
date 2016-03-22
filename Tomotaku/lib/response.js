var json = require('./Response.json');

module.exports = {
    getResponse: function (question) {
        return json[question];
    },

    exist: function (question) {
        return json[question] != null
    }
}