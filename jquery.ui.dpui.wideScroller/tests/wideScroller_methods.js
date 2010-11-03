/*
 * wideScroller_methods.js
 */


(function($) {

module("wideScroller: ui core");
test("Number of items display", function() {

    var el = $("#scroller").wideScroller();

    expect(2);

	var value = $('.ws-totalItems').html();
	equals( 4, value, "Total number of items should be 3" );

	var value = $('.ws-currentItem').html();
	equals( 1, value, "Current item should be 1" );

});

test("1st Item Location/Offset", function() {
    expect(1);


    var locatorOffset = $("#locator").offset().left + "px";
    var itemOffset = $(".active").css("left");

    equals( locatorOffset, itemOffset, "Offest of locator and active image match" );


});

module("wideScroller: events & callbacks");
test("Stop & Start Callback", function() {
    stop();
    expect(2);

    var startCount = 0;
    var stopCount = 0;


    $("#scroller").wideScroller("option", "startScroll", function(){ startCount++;});
    $("#scroller").wideScroller("option", "stopScroll", function(){ stopCount++; });


    $('.next').click();

    var timer = setInterval(function(){test()}, 4000);

    function test() {
        equals( startCount, 1, "start callback happened once" );
        equals( stopCount, 1, "stop callback happened once" );
        clearInterval(timer);
        start();
    }
});

test("Bind Controls, Prev/Next Callback", function() {
    stop();
    expect(2);

    var next = 0, prev = 0;

	$("#scroller").wideScroller("option", "next", function(){ next++; });
    $("#scroller").wideScroller("option", "previous", function(){ prev++; });

    $('.next').click();
	equals( next, 1, "next button bound -> next callback happened once" );

    var timer = setInterval(function(){test()}, 4000);

    function test() {
        $('.prev').click();
	    equals( prev, 1, "prev button bound -> prev callback happened once" );
        clearInterval(timer);
        start();
    }
});



test("Window Resize Event & Callback", function() {
    expect(2);

    stop()

    var origWidth = $(window).width();
    var origHeight = $(window).height();

    var resize = 0;
    $("#scroller").wideScroller("option", "resize", function(){ resize++; });


    window.resizeTo(800,600);
    var timer = setInterval(function(){test()}, 1000);

    function test() {
        var locatorOffset = $("#locator").offset().left + "px";
        var itemOffset = $(".active").css("left");
        equals( locatorOffset, itemOffset, "Offest of locator and active image match" );
        ok( resize !== 0, "Resize callback happened at least once" );


        window.resizeTo(origWidth, origHeight);
        clearInterval(timer);
        start();
    }

});

module("wideScroller: option");
test("Specify Start Image", function() {

    expect(1);

    $("#scroller").wideScroller("destroy");

    var items = $(".scrollable-item");

    $("#scroller").wideScroller({
        goToItem: '3'
    });

    ok($(items[2]).hasClass("active"), "Second Image Is Active" );

});


//TODO Test re-order
//TODO Test Spinner


})(jQuery);
