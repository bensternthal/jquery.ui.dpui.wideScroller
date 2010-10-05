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


    var locatorOffset = $("#locator").offset().left + "px";
    var itemOffset = $(".active").css("left");

    equals( locatorOffset, itemOffset, "Offest of locator and active image match" );


});

module("wideScroller: events");
test("Bind controls, prev/next", function() {

    stop()

    expect(2);

    var next = 0, prev = 0;

	$("#scroller").wideScroller("option", "next", function(){ next++; });
    $("#scroller").wideScroller("option", "previous", function(){ prev++; });

    $('.next').click();
	equals( next, 1, "next callback happened once" );

    var timer = setInterval(function(){test()}, 4000);

    function test() {
        $('.prev').click();
	    equals( prev, 1, "prev callback happened once" );
        clearInterval(timer);
        start();
    }

});

test("Window Resize Event", function() {


    expect(1);

    stop()

    var origWidth = $(window).width();
    var origHeight = $(window).height();

    window.resizeTo(800,600);
    var timer = setInterval(function(){test()}, 1000);

    function test() {
        var locatorOffset = $("#locator").offset().left + "px";
        var itemOffset = $(".active").css("left");
        equals( locatorOffset, itemOffset, "Offest of locator and active image match" );
        window.resizeTo(origWidth, origHeight);
        clearInterval(timer);
        start();
    }



});

module("wideScroller: option");
test("Specify Start Image", function() {

    expect(1);

    $("#scroller").wideScroller("destroy");

    $("#scroller").wideScroller({
        goToItem: '2'
    });

    var items = $(".scrollable-item");
    ok($(items[1]).hasClass("active"), "Second Image Is Active" ); 

});

//test re-order

})(jQuery);


