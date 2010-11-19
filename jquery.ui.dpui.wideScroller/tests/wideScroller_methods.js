/*
 * wideScroller_methods.js
 */


(function($) {

    module("wideScroller: ui core");
    test("Number of items display", function() {

        expect(2);

        var value = $('.ws-totalItems').html();
        equals( 4, value, "Total number of items should be 4" );

        var value = $('.ws-currentItem').html();
        equals( 1, value, "Current item should be 1" );

    });

    test("1st Item Location/Offset", function() {
        expect(1);

        stop();
        var locatorOffset = $("#locator").offset().left;


        var timer = setInterval(function(){test()}, 1000);

        function test() {
            var itemOffset = $(".dpui-ws-active").offset().left;
            equals( locatorOffset, itemOffset, "Offest of locator and active image match" );
            clearInterval(timer);
            start();


        }
    });

    module("wideScroller: events & callbacks");
    test("Next Callback & Stop/Start Callback", function() {
        stop();
        expect(3);

        var startCount = 0,
            stopCount = 0,
            next = 0;

        $("#scroller").wideScroller("option", "startScroll", function(){ startCount++;});
        $("#scroller").wideScroller("option", "stopScroll", function(){ stopCount++; });
        $("#scroller").wideScroller("option", "nextButtonClick", function(){ next++; });

        $('.next').click();

        var timer = setInterval(function(){test()}, 4000);

        function test() {
            equals( startCount, 1, "start callback happened once" );
            equals( stopCount, 1, "stop callback happened once" );
            equals( next, 1, "next button bound -> next callback happened once" );
            clearInterval(timer);
            start();
        }

    });

    test("Prev Callback & Stop/Start Callback", function() {
        stop();
        expect(3);

        var startCount = 0,
            stopCount = 0,
            prev = 0;

        $("#scroller").wideScroller("option", "startScroll", function(){ startCount++;});
        $("#scroller").wideScroller("option", "stopScroll", function(){ stopCount++; });
        $("#scroller").wideScroller("option", "previousButtonClick", function(){ prev++; });


        $('.prev').click();

        var timer = setInterval(function(){test()}, 4000);

        function test() {
            equals( startCount, 1, "start callback happened once" );
            equals( stopCount, 1, "stop callback happened once" );
            equals( prev, 1, "prev button bound -> prev callback happened once" );
            clearInterval(timer);
            start();
        }

    });

    module("wideScroller: option");
    test("Specify Start Image", function() {

        expect(1);

        $("#scroller").wideScroller("destroy");

        var items = $(".dpui-ws-item");

        $("#scroller").wideScroller({
            goToItem: '3'
        });

        ok($(items[2]).hasClass("dpui-ws-active"), "Third Image Is Active" );

    });

    test("Show Loader", function() {
        stop();
        expect(1);

        $("#scroller").wideScroller("showLoader");

        var timer = setInterval(function(){test()}, 2000);

        function test() {
            ok($('#scroller-spinner').is(':visible'), "Loader is Visible" );
            clearInterval(timer);
            start();
        }
    });

    test("Hide Loader", function() {
        stop();
        expect(1);

        $("#scroller").wideScroller("hideLoader");

        var timer = setInterval(function(){test()}, 2000);

        function test() {
            ok($('#scroller-spinner').is(':hidden'), "Loader is Hidden" );
            clearInterval(timer);
            start();
        }
    });


/*

Does not work well enough cross browser to use, problems with IE, Chrome
test("Window Resize Event & Callback", function() {
    expect(2);

    stop();

    var origWidth = $(window).width();
    var origHeight = $(window).height();

    var resize = 0;
    $("#scroller").wideScroller("option", "resize", function(){ resize++; });


    window.resizeTo(2000,1000);
    var timer = setInterval(function(){test()}, 1000);

    function test() {
        var locatorOffset = $("#locator").offset().left + "px";
        var itemOffset = $(".active").css("left");
        equals( locatorOffset, itemOffset, "Offest of locator and active image match" );
        ok( resize !== 0, "Resize callback happened at least once (wont work in chrome/ie since resizeTo used in test)" );

        console.log(locatorOffset);
        //window.resizeTo(origWidth, origHeight);
        clearInterval(timer);
        start();
    }

});
*/

//TODO Test Spinner


})(jQuery);
