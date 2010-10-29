/*
 * jQuery UI Wide Scroller
 *
 * Copyright (c) 2010 DevPatch (http://www.devpatch.com) "Fire Up The Quattro"
 * Licensed under the GPL license
 *
 * Depends:
 *      jquery 1.4.2
 *      jquery.ui 1.8.2
 *      jquery.ba-throttle-debounce.min.js 1.1 (http://benalman.com/projects/jquery-throttle-debounce-plugin/)
 *
 * Callbacks
 *      startScroll
 *      stopScroll
 *      next
 *      previous
 *      resize
 *
 *  TODO: make spinner/pagenumbers optional
 */

(function($) {

    $.widget("ui.wideScroller", {
        options: {
            offsetLocator: '#locator',
            items: '.scrollable-item',
            container: '#scroller-container',
            nextButton: '.next',
            prevButton: '.prev',
            currentClass: '.active',
            currentItemDisplayClass: '#rid-ws-currentItem',
            totalItemDisplayClass: '#rid-ws-totalItems',
            spinner: '#scroller-spinner',
            goToItem: null,
            easing: 'easeInQuad',
            speed: 600
        },

        _create: function() {
            var self = this, o = this.options, e = this.element;
            // Default Class For All Devpatch Widgets
            e.addClass("dpui-widget");

            // Bind Resize & Throttle
            $(window).resize($.throttle(500, function(){
                self.resize();
            }));

            // Bind Buttons
            self._bindControls();

            self.itemsLength = $(o.items).length;

            //if only one image hide controls
            if (self.itemsLength <= 1){
                $(o.prevButton +", " + o.nextButton).hide();
            }

            // If specific start image specified
            if (o.goToItem !== null) {
                self._reOrderItems();
            }

            // Persistant Vars For Reset
            self._initialState = e.html();

            // Set Initial Positions and Wrapped Images
            self.setItemPosition();

        },

        _bindControls: function() {
            var self = this, o = this.options;

            // Bind Next
            $(o.nextButton).bind('click', function(event){
                self.moveNext();
                self._unbindControls();

                // callback
                self._trigger('next', event);
                return false;
            });

            // Bind Prev
            $(o.prevButton).bind('click', function(event){
                self.movePrev();
                self._unbindControls();

                // callback
                self._trigger('previous', event);
                return false;
            });
        },

        _unbindControls: function() {
            var o = this.options;

            $(o.prevButton).unbind();
            $(o.nextButton).unbind();
        },

        _reOrderItems: function() {
            var o = this.options;

            //Reorder dom elements for load
            var items = $(o.items);
            items.removeClass('active');
            $(items[o.goToItem-1]).addClass('active');

            for (var i=0; i<(o.goToItem - 1); i++) {
                $(items[i]).detach().appendTo(o.container);
            }

            //ie mem leak
            items = null;
        },

        setItemPosition: function() {
            var self = this, o = this.options;

            var windowOffset = $(o.offsetLocator).offset();
            var windowWidth = $(window).width();
            var items = $(o.items);
            var offsetWidth = 0;
            var leftWidth = 0;
            var overflowElements = [];
            var count = 0;


            // Cycle through and arrange images
            $.each(items,function() {
                // First Image
                if(offsetWidth === 0) {
                    $(this).css('left',windowOffset.left);
                    offsetWidth = $(this).outerWidth();
                } else {
                    // Test for Images Off screen and add to array to be dealt with later
                    if((offsetWidth + windowOffset.left) >= windowWidth) {
                        overflowElements[count] = this;
                        count++;
                    // Append Images To The Left
                    } else {
                        $(this).css('left', (offsetWidth + windowOffset.left));
                        offsetWidth += $(this).outerWidth();
                    }
                }
            });

            // Deal with front images
            overflowElements.reverse();

            $.each(overflowElements, function() {
                leftWidth += $(this).outerWidth();
                $(this).css('left', (windowOffset.left - leftWidth)).prependTo(o.container);
            });

            // Image Numbers
            self._updateItemNumber();


            //Hide Spinner
            setTimeout(function(){
                $(o.spinner).fadeOut();
            }, 800);
        },

        moveNext: function() {
            var self = this, o = this.options, e = this.element;
            var windowWidth = $(window).width();
            var items = $(o.items);
            var itemsLength = $(o.items).length;
            var activeItem = e.find(o.currentClass);
            var totalWidth = 0;

            //Highlight Image Move Active Class
            self._highlightItem('next');

            // Find Location Of Last Element
            var lastItem = $(items).last();
            var offset = lastItem.offset();

            // Clone Loop
            self.swappedElement = $(items).first();
            var myDiv = $('<div></div>')
                    .html(self.swappedElement.html())
                        .addClass('scrollable-item')
                        .css('left', (lastItem.outerWidth() + offset.left))
                        .appendTo(o.container);

            lastItem = $(o.items).last();
            totalWidth = (parseInt(lastItem.css("left"),10) + lastItem.outerWidth()) - activeItem.outerWidth();

            //fixes when images do not fill screen
            if (totalWidth < windowWidth) {
                var i = 0;

                while(totalWidth <= windowWidth) {
                    i++;
                    $(items[i]).css('left', (lastItem.outerWidth() + lastItem.offset().left))
                                .detach()
                                .appendTo(o.container);

                    totalWidth += $(items[i]).outerWidth();
                    lastItem = $(items[i]);
                }
            }


            // Do Scroll - TODO: figure out why activeItem must be declared & why this has to go here or wrong width
            var moveDistance = activeItem.outerWidth() + "px";

            self._scroll('next',moveDistance, function(){
                self._scrollOnComplete('next' );
            });

        },

        movePrev: function() {
            var self = this, o = this.options, e = this.element;
            var windowWidth = $(window).width();
            var items = $(o.items);
            self.shortClass = "";
            self.nextItem = "";
            var activeItem = e.find(o.currentClass);

            //Highlight Item
            self._highlightItem('prev');

            var lastItem = $(o.items).last();
            var totalWidth = (parseInt(lastItem.css("left"),10) + lastItem.outerWidth()) - activeItem.outerWidth();

            if(lastItem.offset().left + self.nextItem.outerWidth() > windowWidth) {
                // Find Location Of First Element
                var firstItem = $(items).first();
                var offset = firstItem.offset();

                self.swappedElement = $(items).last();
                var myDiv = $('<div></div>')
                            .html(self.swappedElement.html())
                            .addClass('scrollable-item '+ self.shortClass)
                            .css('left', (offset.left - self.swappedElement.outerWidth()))
                            .prependTo(o.container);
            }

            // Do Scroll
            var moveDistance = self.nextItem.outerWidth() + "px";

            self._scroll('prev',moveDistance, function(){
                self._scrollOnComplete('prev');
            });


        },

        _scroll: function( direction, distance, callback ) {
            var self = this, o = this.options, e = this.element;
            var count = 0;

            //start scroll callback
            self._trigger('startScroll');

            switch(direction) {
                case "next":
                    $(o.items).animate({'left': "-="+distance},
                    o.speed,
                    o.easing,function(){
                        count++;
                        if(count >= $(o.items).length) {
                            callback();
                        }
                    });

                    break;

                case "prev":
                    $(o.items).animate({'left': "+="+distance},
                    o.speed,
                    o.easing,function(){
                        count++;
                        if(count >= $(o.items).length) {
                            callback();
                        }
                    });

                    break;

                default:
                    break;
            }
        },

        _scrollOnComplete: function( direction ) {
            var self = this, o = this.options;
            //IE memory leak prevention

            if(self.swappedElement) {
                self.swappedElement.remove();
                self.swappedElement = null;
            }

            //Rebind Action Buttons
            self._bindControls();

            //Item Number
            self._updateItemNumber( direction );


            //Callback
            self._trigger('stopScroll');

        },

        _highlightItem: function ( direction ) {
            var self = this, o = this.options, e = this.element;

            var activeItem = e.find(o.currentClass);

            if(direction === "next") {
                self.nextItem = activeItem.next();
            } else {
                if(activeItem.prev().length!==0) {
                    self.nextItem = activeItem.prev();
                } else {
                    //no items before so use last on right
                    self.nextItem = $(o.items[(self.itemsLength -1)]);
                    self.shortClass = "active";
                }
            }

            activeItem.removeClass('active');
            self.nextItem.addClass('active'); //TODO: fix when not defined (short list)

        },

        _updateItemNumber: function( direction ) {
            var self = this, o = this.options, e = this.element;

            // Set Total
            $(o.totalItemDisplayClass).html(self.itemsLength);

            // Get Current
            var currentPage = parseInt($(o.currentItemDisplayClass).html(),10);

            switch( direction ) {
                case "next":

                    if( currentPage < self.itemsLength ) {
                        currentPage++;
                    } else {
                        currentPage = 1;
                    }
                    $(o.currentItemDisplayClass).html(currentPage);

                    break;
                case "prev":

                    if( currentPage > 1 ) {
                        currentPage--;
                    } else {
                        currentPage = self.itemsLength;
                    }
                    $(o.currentItemDisplayClass).html(currentPage);

                    break;
                default:
                    $(o.currentItemDisplayClass).html("1");

                    break;
            }


        },

        resize: function() {
            var self = this, o = this.options, e = this.element;
            //Restore Original Order And Re-Invoke
            e.html(self._initialState);
            self.setItemPosition();

            //callback
            self._trigger('resize')
        },

        destroy: function() {
            var self = this, o = this.options, e = this.element;
            e.removeClass('rid-widget');
            $(o.nextButton).unbind('click');
            $(o.prevButton).unbind('click');
            $(o.spinner).hide();
            e.html(self._initialState);
            $(o.items).css('left','0');

            $.Widget.prototype.destroy.apply(this, arguments);
            return this;
        },

        // utility method not really used
        whatsVisible: function() {
            var self = this, o = this.options, e = this.element;

            var windowWidth = $(window).width();
            var items = $(o.items);
            var itemsLength = items.length;
            var visibleItems = [];


            while(itemsLength--) {
                var offSetLeft = $(items[itemsLength]).offset().left;
                var offSetWidth = offSetLeft + $(items[itemsLength]).outerWidth();

                if( (offSetWidth >= 0) && (offSetLeft <= windowWidth) ) {
                    visibleItems.push($(items[itemsLength]));
                }
            }

            //return visibleItems
            console.log(visibleItems);

        }

    });

})(jQuery);