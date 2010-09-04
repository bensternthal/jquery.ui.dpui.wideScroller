/**
 * Provides feautures for handling/processing URL
 * invoked on page: var request = new Request();
 *
 */	
function Request() {
	this.URL = window.location.href;
	this.hash =  window.location.hash;
	this.pathname = window.location.pathname;
	this.searchEncoded = window.location.search.substring(1);
	this.search = decodeURIComponent(this.searchEncoded.replace(/\+/g,  " "));
	
	//@return array of values from request							
	this.queryString = function () {
		var queryList = new Array();					
		
		if(this.search.length > 0) {
			var pairs = this.search.split('&');
	
			for(i=0; i<pairs.length; i++) {
				var keyValuePair = pairs[i].split("="); 
				var quoteFixedValue = keyValuePair[1].replace(/\'/g,  "&#39;");
	
				queryList[i]= [[keyValuePair[0]],quoteFixedValue];
			}
			return queryList;
		}	
	}
	
	//@return single value from request that match key
	this.keyValueFinder = function(key,queryList) {
		var keyValue = "";
		
		for(var i in queryList) { 
 			if(queryList[i][0] == key) {
 				keyValue = queryList[i][1];
 			}
		}
		return keyValue.toString();				
	}	
}