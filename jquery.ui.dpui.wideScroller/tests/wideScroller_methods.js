/*
 * wideScroller_methods.js
 */
(function($) {

module("wideScroller: ui");
test("Number of items display", function() {

    var el = $("#scroller").wideScroller();

    
    expect(2);
    
	var value = $('#rid-ws-totalItems').html();
	equals( 3, value, "Total number of items should be 3" );
	
	var value = $('#rid-ws-currentItem').html();
	equals( 1, value, "Current item should be 1" );

});

test("1st Item Location/Offset", function() {
    expect(1);

    //find loctor offset
    //find 1st image offset
    //test that they are equal

    var locatorOffset = $("#locator").offset().left + "px";
    var itemOffset = $(".active").css("left");

    equals( locatorOffset, itemOffset, "Offest of locator and active image match" );    
});

module("wideScroller: events");
test("Bind previous/next buttons", function() {

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

test("Window Resize Event", function() {
    expect(1);

    var origWidth = $(window).width();
    var origHeight = $(window).height();

    window.resizeTo(800,600);   

    var locatorOffset = $("#locator").offset().left + "px";
    var itemOffset = $(".active").css("left");

    equals( locatorOffset, itemOffset, "Offest of locator and active image match" );

    window.resizeTo(origWidth, origHeight);
});




})(jQuery);

