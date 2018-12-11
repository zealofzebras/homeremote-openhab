var request = require('sync-request');

module.exports = function() { 
    this.HTTPClient = function() {
        this.get = function( url, options ) {
            var res = request('GET', url, options);
            return {
                data: JSON.parse(res.getBody())
            };
        },	
    
        this.post = function( url, data, callback ) {
            console.log("not implemented");
        }
    
    }
    //etc
}
