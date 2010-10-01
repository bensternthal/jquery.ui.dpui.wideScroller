/* 
 * jQuery UI Wide Scroller
 *
 * Copyright (c) 2010 DevPatch (http://www.devpatch.com)
 * Licensed under the GPL license
 * 
 * Depends:
 *      jquery 1.4.2   
 *      jquery.ui 1.8.2
 *      jquery.ba-throttle-debounce.min.js 1.1 (http://benalman.com/projects/jquery-throttle-debounce-plugin/)
 *      
 */
 
(function($) {
    
    $.widget( "ui.wideScroller", {
        options: {
            offsetLocator: '#locator',
            items: '.scrollable-item',
            container: '#scroller-container',
            nextButton: '.next',
            prevButton: '.prev',
            currentClass: '.active',
            captionClass : '.scrollable-meta',
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
            $(window).resize($.throttle(500,function(){
                self.resize();
            }));

            // Bind Buttons
            self._bindControls();
            
            self.itemsLength = $(o.items).length;

            //if only one image hide controls
            if(self.itemsLength <=1){
                $(o.prevButton +", " + o.nextButton).hide();
            }             
            
            // If specific start image specified
            if(o.goToItem != null) {
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
            $(o.nextButton).bind('click',function(){
                self.moveNext();
                self._unbindControls();

                // callback
                self._trigger('next', null, null);
                return false;
            });

            // Bind Prev
            $(o.prevButton).bind('click',function(){
                self.movePrev();
                self._unbindControls();

                //callback
                self._trigger('previous', null, null);                
                return false;
            });
        },

        _unbindControls: function() {
            var self = this, o = this.options;
            
            $(o.prevButton).unbind();
            $(o.nextButton).unbind();
        },

        _reOrderItems: function() {
            var self = this, o = this.options;
            
            //Reorder dom elements for load
            var items = $(o.items);
            items.removeClass('active');
            $(items[o.goToItem-1]).addClass('active');                     
            
            for (var i=0; i<(o.goToItem - 1); i++) {    
                $(items[i]).detach().appendTo(o.container)
            }  
            
            //ie mem leak
            items = null;         
        },
        
        setItemPosition: function() {
            var self = this, o = this.options, e = this.element; 
            
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
                if(offsetWidth == 0) {
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
            })
            
            // Image Numbers
            self._updateItemNumber();
                        
            // Show Credit
            $(o.currentClass +" " +o.captionClass).show();
            
            //Hide Spinner
            setTimeout(function(){
                $(o.spinner).fadeOut()
            }, 800);  
            
                    
        },
        
        moveNext: function() {                
            var self = this, o = this.options, e = this.element;                
            var windowWidth = $(window).width();
            var items = $(o.items);
            
            //Highlight Item
            var activeItem = e.find(o.currentClass);
            var nextItem = activeItem.next();     
            //Hide Info
            activeItem.find(o.captionClass).hide();                                 
            activeItem.removeClass('active'); 
            nextItem.addClass('active');
            
            
            
            // Find Location Of Last Element
            var lastItem = $(items[(self.itemsLength -1)]);            
            var offset = lastItem.offset();
            
            
            //Clone For Smooth Scrolling Off Edge  
            self.swappedElement = $(items[0]);                                  
            var myDiv = $('<div></div>')
                        .html(self.swappedElement.html())
                        .addClass('scrollable-item')
                        .css('left', (lastItem.outerWidth() + offset.left))                                    
                        .appendTo(o.container);
                                                    
            // Do Scroll             
            var moveDistance = activeItem.outerWidth() + "px";                        
            
            self._scroll('next',moveDistance, function(){ 
                //IE memory leak prevention
                self.swappedElement.remove();
                self.swappedElement = null;
                myDiv = null;
                activeItem = null;
                nextItem = null;
                
                //Rebind Action Buttons
                self._bindControls();
                
                //Item Number
                self._updateItemNumber('next');                
                
                // Show Credit
                $(o.currentClass +" " +o.captionClass).fadeIn('fast');              
            });
        },
        
        movePrev: function() {
            var self = this, o = this.options, e = this.element;                
            var windowWidth = $(window).width();
            var items = $(o.items);
            var isShortClass = "";
            
            //Highlight Item
            var activeItem = e.find(o.currentClass);
            
            
            if(activeItem.prev().length!=0) {            
                var nextItem = activeItem.prev();
            } else {
                //no items before so use last on right            
                var nextItem = $(items[(self.itemsLength -1)]); 
                isShortClass = "active";
            }    
            
            activeItem.find(o.captionClass).hide();                                                         
            activeItem.removeClass('active'); 
            nextItem.addClass('active');            
           
            
            // Find Location Of First Element
            var firstItem = $(items[0]);
            var offset = firstItem.offset(); 
            
            //Clone For Smooth Scrolling Off Edge  
            self.swappedElement = $(items[(self.itemsLength -1)]);                                  
            var myDiv = $('<div></div>')
                        .html(self.swappedElement.html())
                        .addClass('scrollable-item '+ isShortClass)
                        .css('left', (offset.left - self.swappedElement.outerWidth()))                                    
                        .prependTo(o.container);
                        
             
            // Do Scroll             
            var moveDistance = nextItem.outerWidth() + "px";  
            
            self._scroll('prev',moveDistance, function(){ 
                //IE memory leak prevention
                self.swappedElement.remove();
                self.swappedElement = null;
                myDiv = null;
                activeItem = null;
                nextItem = null;
                
                //Rebind Action Button
                self._bindControls();
                
                //Item Number
                self._updateItemNumber('prev');
                
                // Show Credit
                $(o.currentClass +" " +o.captionClass).fadeIn('fast');              
            });            
        },
        
        _scroll: function( direction, distance, callback ) {
            var self = this, o = this.options, e = this.element;                
            
            switch(direction) {
                case "next":
                    var count = 0;
        
                    $(o.items).animate({'left': "-="+distance},
                    o.speed,
                    o.easing,function(){
                        if(count < self.itemsLength) {
                            count++;
                        } else {
                            callback();
                        }
                    });
                                    
                    break;
                case "prev":
                    var count = 0;
        
                    $(o.items).animate({'left': "+="+distance},
                    o.speed,
                    o.easing,function(){
                        if(count < self.itemsLength) {
                            count++;
                        } else {
                            callback();
                        }
                    });
                                     
                    break;
                default:
                    break;                                       
            }
        },
        
        _updateItemNumber: function( direction ) {
            var self = this, o = this.options, e = this.element; 
            
            // Set Total            
            $(o.totalItemDisplayClass).html(self.itemsLength);
            
            // Get Current
            var currentPage = parseInt($(o.currentItemDisplayClass).html());
            
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
        },
         
        destroy: function() {
            var self = this, o = this.options, e = this.element;            
            e.removeClass('rid-widget');
            $(o.nextButton).unbind('click');
            $(o.prevButton).unbind('click');
            $(o.spinner).hide()                         
            e.html(self._initialState);
            $(o.items).css('left','0');
            
            $.Widget.prototype.destroy.apply(this, arguments);
            return this;
        }
      
    }); 
    
})(jQuery);