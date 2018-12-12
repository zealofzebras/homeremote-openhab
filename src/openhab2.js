
// PLUGIN SETUP
plugin.OnChangeRequest = onChangeRequest;
plugin.OnConnect = onConnect;
plugin.OnDisconnect = onDisconnect;
plugin.OnPoll = onPoll;
plugin.OnSynchronizeDevices = onSynchronizeDevices;
plugin.PollingInterval = 1000;
//IMPORTANT!  This is not the HostName used.  Value actually used is configured in "Properties" pane.     
plugin.Settings = { "LocalUrl": "http://192.168.1.100:8080", "RemoteUrl": "https://myopenhab.org:443", "Username": "email@email.com", "Password" : "secret", "Sitemap" : "main"  };


// GLOBAL VARIABLES

var http = new HTTPClient();
var URL = "";

// DEBUGGING HELPERS

var debug = {
    log: function(m) { console.log((typeof m) === "string" ? m : "Warning: cannot show objects" ); if (typeof Debug === "undefined") debug.delay(1000);},
    output: function(m) { if (typeof Debug !== "undefined") console.log(m); },
    delay: function (delay) { var waitTill = new Date(new Date().getTime() + delay); while(waitTill > new Date()){} }
}

function onChangeRequest(device, attribute, value) {
  
}


function onDisconnect() {
}

function onPoll() {
    
}



function onConnect() {

    try {
   	    debug.log("Testing Local Connection")
        debug.log(plugin.Settings["LocalUrl"] + "/rest/uuid");
        var options = { headers: { 'Authorization': "Basic " + "" } };  
    	var t = http.get(plugin.Settings["LocalUrl"] + "/rest/uuid", options);
         if (t.status == 200) {
            debug.log("Connected Locally");
            URL = plugin.Settings["LocalUrl"];
    		return;
        }   	
    } catch (err) {
        debug.log(err);
        debug.log("Local Connection Failed.  Testing Cloud Connection.")

        var options = { auth: {
            username: plugin.Settings["Username"],
            password: plugin.Settings["Password"]
          }
        };  
    	var t = http.get(plugin.Settings["RemoteUrl"] + "/rest/uuid", options);
    	if (t.status == 200) {
            debug.log("Connected via Cloud");
		    URL = plugin.Settings["RemoteUrl"];
    		return;
        }   	
    } finally {
        // FOR IN DESIGNER TESTING ONLY
        if (URL !== "")
            onSynchronizeDevices();
    }
    debug.log("Connection to OpenHab Failed")
}


function onSynchronizeDevices() {   
    var options = { headers: { 'Authorization': "Basic " + "" } };
    debug.log(URL + "/rest/sitemaps/" + plugin.Settings["Sitemap"]);
    
    var r = http.get(URL + "/rest/sitemaps/" + plugin.Settings["Sitemap"], options );
  
    debug.log("reading sitemap: " +  plugin.Settings["LocalUrl"] + "/rest/sitemaps/" + plugin.Settings["Sitemap"]);
   
    var json = r.data;
    var allDevices = [];
    pushArray(allDevices, AddWidgetDevices(json.homepage.widgets))
    plugin.Devices = allDevices;
}

function AddWidgetDevices(widgets) {
    var allDevices = [];
    for(var i in widgets) {
        var w = widgets[i];
        switch (w.type) {
            case "Frame":
                break;

            case "Text":
                var pluginDevice = new Device();
                pluginDevice.Id = w.widgetId;
                pluginDevice.DisplayName = w.label;
                pluginDevice.Icon = w.icon + ".png";

                switch (w.icon) {
                    case "temperature":
                        pluginDevice.DeviceType = "Light";
                        pluginDevice.TileTemplate = "LightTile.xaml";
                        pluginDevice.DetailsTemplate = "LightDetails.xaml";

                        break;
                    default:
                        break;
                }

                pluginDevice.Capabilities = ["Switch"];
                pluginDevice.Attributes = [];
                allDevices.push(pluginDevice);
                break;
            case "Switch":
                var pluginDevice = new Device();
                pluginDevice.Id = w.widgetId;
                pluginDevice.DisplayName = w.label;
                pluginDevice.Icon =  w.icon + ".png";

                switch (w.icon) {
                    case "light":
                    default:
                        pluginDevice.DeviceType = "Light";
                        pluginDevice.TileTemplate = "LightTile.xaml";
                        pluginDevice.DetailsTemplate = "LightDetails.xaml";
                        allDevices.push(pluginDevice);

                        break;
                }
                pluginDevice.Capabilities = ["Switch"];
                pluginDevice.Attributes = [];
                allDevices.push(pluginDevice);
                break;
            default:
                break;
        }
        if(w.hasOwnProperty("widgets")){
            pushArray(allDevices, AddWidgetDevices(w.widgets))
        }
    }
    return allDevices;
}


// UTILITY FUNCTIONS

function getDevice(id) {
    for (var d in plugin.Devices) {
        var device = plugin.Devices[d];
        if (device.Id == id) {
            return device;
        }
    }
    return null;
}

function pushArray(list, other) {
    var len = other.length;
    var start = list.length;
    list.length = start + len;
    for (var i = 0; i < len; i++ , start++) {
        list[start] = other[i];
    }
}

