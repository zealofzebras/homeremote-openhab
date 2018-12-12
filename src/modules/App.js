
// This is actually not available to plugins
global.App = {
    GetVariableValue: function(variable) {

    },
    ShowToast: function(msg) {
        console.log("TOAST: " + msg)
    },
    SetVariableValue: function(variable, value) {

    },
    Delay: function(delay) {  
        // very forcefull but has not other requirements  
        var waitTill = new Date(new Date().getTime() + delay);
        while(waitTill > new Date()){}
    },
    GoToPage: function(pageName) {

    }

};
