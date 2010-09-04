/*
 * wideScroller_methods.js
 */
(function($) {

module("wideScroller: methods");

test("number of items display", function() {
	var value = $('#rid-ws-totalItems').html();
	equals( 3, value, "total number of items should be 3" );
	
	var value = $('#rid-ws-currentItem').html();
	equals( 1, value, "current item should be 1" );		
});



})(jQuery);

