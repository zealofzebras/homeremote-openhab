// Our custom httpclient module
require("./modules/HTTPClient.js")();
require("./modules/Device.js")();
var fs = require("fs");

// Setup the plugin object
global.plugin = {};

// Include the openhab2 plugin file
console.log("Loading plugin");
require("./openhab2.js");

// Include user specific settings (this is excluded from git since it could contain password information)
if (fs.existsSync('./settings.js')) {
    console.log("Loading custom settings");
    require("./settings.js");
} else {
    console.log("No custom settings");
}

console.log("Running sync test");
plugin.OnSynchronizeDevices();

console.log("List devices");
console.log(plugin.Devices);