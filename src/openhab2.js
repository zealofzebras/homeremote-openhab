plugin.OnChangeRequest = onChangeRequest;
plugin.OnConnect = onConnect;
plugin.OnDisconnect = onDisconnect;
plugin.OnPoll = onPoll;
plugin.OnSynchronizeDevices = onSynchronizeDevices;
plugin.PollingInterval = 1000;
//IMPORTANT!  This is not the HostName used.  Value actually used is configured in "Properties" pane.     
plugin.Settings = { "LocalUrl": "http://192.168.1.100:8080", "RemoteUrl": "https://myopenhab.org:443", "Username": "email@email.com", "Password" : "secret", "Sitemap" : "main"  };

var http = new HTTPClient();

function getDevice(id) {
    for (var d in plugin.Devices) {
        var device = plugin.Devices[d];
        if (device.Id == id) {
            return device;
        }
    }
    return null;
}

function onChangeRequest(device, attribute, value) {
    var commandService;
    var commandAction;
    switch (attribute) {
        case "Level":
            commandService = "urn:upnp-org:serviceId:Dimming1";
            commandAction = "SetLoadLevelTarget&newLoadlevelTarget=" + value;
            break;
        case "Switch":
            commandService = "urn:upnp-org:serviceId:SwitchPower1";
            commandAction = ((value == "On") ? "SetTarget&newTargetValue=1" : "SetTarget&newTargetValue=0");
            break;
        default:
            return;
    }
    http.get("http://" + plugin.Settings["HostName"] + ":3480/data_request?id=lu_action&DeviceNum=" + device.Id + "&serviceId=" + commandService + "&action=" + commandAction);
}

function onConnect() {
}

function onDisconnect() {
}

function onPoll() {
    var options = {
        timeout: -1,
        params: {
            id: "status",
            output_format: "json",
            MinimumDelay: 1000
        }
    };
    var r = http.get("http://" + plugin.Settings["HostName"] + ":3480/data_request", options);
    var json = r.data;
    for (var d in json.devices) {
        var deviceJson = json.devices[d];
        var device = getDevice(deviceJson.id);
        if (device != null) {
            for (var s in deviceJson.states) {
                var stateJson = deviceJson.states[s];
                switch (stateJson.service) {
                    case "urn:upnp-org:serviceId:SwitchPower1":
                        if (stateJson.variable == "Status") {                        
                            device.Switch = ((stateJson.value == "1") ? "On" : "Off");
                        }
                        break;
                    case "urn:upnp-org:serviceId:Dimming1":
                        if (stateJson.variable == "LoadLevelStatus") {
                            device.Level = stateJson.value;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
}

function onSynchronizeDevices() {
    //jeedomPing();
    //alert("test");
    var r = http.get("" + plugin.Settings["LocalUrl"] + "/rest/sitemaps/" + plugin.Settings["Sitemap"] );
    console.log("reading sitemap: " +  plugin.Settings["LocalUrl"] + "/rest/sitemaps/" + plugin.Settings["Sitemap"]);
    var json = r.data;
    console.log(r);
    var allDevices = [];
    pushArray(allDevices, AddWidgetDevices(json.homepage.widgets))
    plugin.Devices = allDevices;
    console.log(plugin.Devices);
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
            console.log("loading widgets");
            pushArray(allDevices, AddWidgetDevices(w.widgets))
        }
    }
    return allDevices;
}

function jeedomPing() {
    var options = {
        timeout: 1000
    };

    // Test for local URL
    var r = http.get(plugin.Settings["LocalUrl"] + "/rest/uuid", options);
        if (r.status == 200) {
        console.log("LOCAL");
        return;
    }

    // Test for remote URL
    options = {
        timeout: 10000
    };
    r = http.get(plugin.Settings["RemoteUrl"] + "/rest/uuid", options);
    if (r.status == 200) {
        console.log("REMOTE");
        return;
    }
    console.log("Jeedom KO");
}

function pushArray(list, other) {
    var len = other.length;
    var start = list.length;
    list.length = start + len;
    for (var i = 0; i < len; i++ , start++) {
        list[start] = other[i];
    }
}