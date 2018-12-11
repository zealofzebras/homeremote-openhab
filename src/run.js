// Our custom httpclient module
require("./modules/HTTPClient.js")();
var fs = require("fs");


// Setup the plugin object
var plugin = {};

// Include the openhab2 plugin file
console.log("Loading plugin");
eval(fs.readFileSync('openhab2.js')+'');

// Include user specific settings (this is excluded from git since it could contain password information)
if (fs.existsSync('./settings.js')) {
    console.log("Loading custom settings");
    eval(fs.readFileSync('settings.js')+'');
    console.log(plugin);
} else {
    console.log("No custom settings");
}

console.log("Running sync test");

onSynchronizeDevices();

console.log("List devices");

console.log(plugin.Devices);