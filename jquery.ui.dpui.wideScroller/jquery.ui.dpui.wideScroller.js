/*
 * jQuery UI Wide Scroller
 *
 * Copyright (c) 2010 DevPatch (http://www.devpatch.com) "Fire Up The Quattro"
 * Licensed under the GPL license
 *
 * Date: ${DATE}
 *
 * Depends:
 *      jquery 1.4.3
 *      jquery.ui 1.8.4
 *      jquery.ba-throttle-debounce.min.js 1.1 (http://benalman.com/projects/jquery-throttle-debounce-plugin/)
 *
 * Callbacks
 *      startScroll
 *      stopScroll
 *      next
 *      previous
 *      resize
 *
 * 
 */

(function($) {

    $.widget("ui.wideScroller", {
        options: {
            offsetLocatorID: '#locator',
            itemsClass: '.scrollable-item',
            activeItemClass: 'active',            
            container: '#scroller-container',
            nextButton: '.next',
            prevButton: '.prev',
            showItemNumbers: true,
            currentItemDisplayClass: '.ws-currentItem',
            totalItemDisplayClass: '.ws-totalItems',
            loaderID: '#scroller-spinner',
            goToItem: null,
            easing: 'linear',
            speed: 300
        },

        _create: function() {
            var self = this,
                o = this.options,
                e = this.element;

            // Default Class For All Devpatch Widgets
            e.addClass("dpui-widget");

            // Bind Window Resize & Throttle
            $(window).resize($.throttle(500, function(){
                self.resize();
            }));

            // Bind Buttons
            self._bindControls();

            // Cache Number Of Items
            self.itemsLength = $(o.itemsClass).length;

            // If only one image hide controls
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
            var self = this,
                o = this.options;

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

            $(o.prevButton + "," + o.nextButton).unbind();
        },

        _reOrderItems: function() {
            var o = this.options,
                items = $(o.itemsClass);

            //Reorder dom elements for load

            items.removeClass(o.activeItemClass);
            $(items[o.goToItem-1]).addClass(o.activeItemClass);

            for (var i=0; i<(o.goToItem - 1); i++) {
                $(items[i]).detach().appendTo(o.container);
            }

            //ie mem leak
            items = null;
        },

        setItemPosition: function() {
            var self = this,
                o = this.options,
                windowOffset = $(o.offsetLocatorID).offset(),
                windowWidth = $(window).width(),
                items = $(o.itemsClass),
                offsetWidth = 0,
                leftWidth = 0,
                overflowElements = [],
                count = 0;


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
            self.hideLoader();
        },

        moveNext: function() {
            var self = this, 
                o = this.options,
                e = this.element,
                windowWidth = $(window).width(),
                items = $(o.itemsClass),
                itemsLength = $(o.itemsClass).length,
                activeItem = e.find("." + o.activeItemClass),
                totalWidth = 0;

            //Highlight Image Move Active Class
            self._highlightItem('next');

            // Find Location Of Last Element
            var lastItem = $(items).last();
            var offset = lastItem.offset();

            // Send in the clone
            self.swappedElement = $(items).first();
            $('<div></div>')
                .html(self.swappedElement.html())
                .addClass('scrollable-item')
                .css('left', (lastItem.outerWidth() + offset.left))
                .appendTo(o.container);

            lastItem = $(o.itemsClass).last();

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
            var self = this,
                o = this.options,
                e = this.element,
                windowWidth = $(window).width(),
                items = $(o.itemsClass),
                activeItem = e.find("." + o.activeItemClass);

            self.shortClass = "";
            self.nextItem = "";

            //Highlight Item
            self._highlightItem('prev');

            var lastItem = $(o.itemsClass).last();
            var totalWidth = (parseInt(lastItem.css("left"),10) + lastItem.outerWidth()) - activeItem.outerWidth();

            if(lastItem.offset().left + self.nextItem.outerWidth() > windowWidth) {
                // Find Location Of First Element
                var firstItem = $(items).first();
                var offset = firstItem.offset();

                self.swappedElement = $(items).last();
                $('<div></div>')
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
            var self = this,
                o = this.options,
                e = this.element,
                count = 0;

            //start scroll callback
            self._trigger('startScroll');

            switch(direction) {
                case "next":
                    $(o.itemsClass).animate({'left': "-="+distance},
                    o.speed,
                    o.easing,function(){
                        count++;
                        if(count >= $(o.itemsClass).length) {
                            callback();
                        }
                    });
 
                    break;

                case "prev":
                    $(o.itemsClass).animate({'left': "+="+distance},
                    o.speed,
                    o.easing,function(){
                        count++;
                        if(count >= $(o.itemsClass).length) {
                            callback();
                        }
                    });

                    break;

                default:
                    break;
            }
        },

        _scrollOnComplete: function( direction ) {
            var self = this,
                o = this.options;

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
            var self = this,
                o = this.options,
                e = this.element,
                activeItem = e.find("." + o.activeItemClass);

            if(direction === "next") {
                self.nextItem = activeItem.next();
            } else {
                if(activeItem.prev().length!==0) {
                    self.nextItem = activeItem.prev();
                } else {
                    
                    //no items before so use last on right
                    // short class is only used in this case in prev function
                    self.nextItem = $(o.itemsClass).last();
                    self.shortClass = o.activeItemClass;
                }
            }

            activeItem.removeClass(o.activeItemClass);
            self.nextItem.addClass(o.activeItemClass);


        },

        _updateItemNumber: function( direction ) {
            var self = this,
                o = this.options,
                e = this.element;

            if(o.showItemNumbers) {
                var currentPage = parseInt($(o.currentItemDisplayClass).html(),10);

                // Set Total
                $(o.totalItemDisplayClass).html(self.itemsLength);


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
            }
        },

        resize: function() {
            var self = this,
                o = this.options,
                e = this.element;
            
            //Restore Original Order And Re-Invoke
            e.html(self._initialState);
            self.setItemPosition();

            //callback
            self._trigger('resize');
        },

        hideLoader: function() {
            var self = this,
                o = this.options;

            if(o.loaderID !== null) {
                setTimeout(function(){
                    $(o.loaderID).fadeOut();
                }, 800);
            }
        },

        /* Not used by default but could be useful */
        showLoader: function() {
            var self = this,
                o = this.options;

            if(o.loaderID !== null) {
                setTimeout(function(){
                    $(o.loaderID).fadeIn();
                }, 800);
            }
        },

        destroy: function() {
            var self = this,
                o = this.options,
                e = this.element;
            
            e.removeClass('rid-widget');
            $(o.nextButton).unbind('click');
            $(o.prevButton).unbind('click');

            self.hideLoader();

            e.html(self._initialState);
            $(o.itemsClass).css('left','0');

            $.Widget.prototype.destroy.apply(this, arguments);
            return this;
        }

    });

})(jQuery);