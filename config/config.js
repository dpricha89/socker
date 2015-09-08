var _ = require('underscore');
var path = require('path');
var nconf = require('nconf');

var SETTINGS_FILE = 'defaults.json';
var file = path.resolve(__dirname, SETTINGS_FILE);

nconf.argv()
    .env()
    .file({ file: file });

/**
 * Honcho config holder
 */
function Config() {

}

Config.get = function get(key) {
    var value = nconf.get(key);
    if (_.isUndefined(value)) {
        // implies a bug
        throw new Error('no config value for key: ' + key);
    }
    return value;
};

module.exports = Config;