/*
 * wideScroller_methods.js
 */
(function($) {

module("wideScroller: methods");

test("number of items display", function() {

    var el = $("#scroller").wideScroller();

    
    expect(2);
    
	var value = $('#rid-ws-totalItems').html();
	equals( 3, value, "total number of items should be 3" );
	
	var value = $('#rid-ws-currentItem').html();
	equals( 1, value, "current item should be 1" );

    
});

module("wideScroller: events");    
test("bind buttons", function() {

    stop()

    expect(2);

    var next = 0, prev = 0;

    var el = $("#scroller").wideScroller({
        next : function(){ next ++; },
        previous: function(){ prev ++; }
    });

    $('.next').click();
	equals( next, 1, "next callback happened once" );


    var timer = setInterval(function(){test()}, 4000);

    function test() {
        $('.prev').click();
	    equals( prev, 1, "prev callback happened once" );
        clearInterval(timer);
        start();        
    };

});




})(jQuery);

