//LbM JS-file

jQuery(document).ready(function($){




var nav = $('#main-nav');
var sidebar = $('#sidebar');
var search = $('#feed-container .feed-search');
var header = $('#site-header');

var startPoint = $(nav).offset().top-25; /* -25px due to margin so elements wont overlap suddenly */
var startPoint2 = $(nav).offset().top+62;

$.event.add(window, "scroll", function(e) {
	e.stopPropagation();
	var p = $(window).scrollTop();
	//console.log(topOffset+", "+topOffset2+", "+p);

	// Change Navigation, sidebar and searchbar position after scrolling past nav's original pos.

	$(nav).css('position',( (p) > startPoint ) ? 'fixed' : 'relative');
	$(nav).css('top',( (p) > startPoint ) ? '0px' : '');

	$(sidebar).css('position',( (p) > startPoint2 ) ? 'fixed' : 'relative');
	$(sidebar).css('top',( (p) > startPoint2 ) ? '50px' : '');

	$(search).css('position',( (p) > startPoint2 ) ? 'fixed' : 'relative');
	$(search).css('top',( (p) > startPoint2 ) ? '50px' : '');

	// Animate topic's opacity on scroll.

    if ($(this).scrollTop() > 1) {
        $(header).stop().animate({
            opacity: 0.1
        }, 300);
    } else {
        $(header).stop().animate({
            opacity: 1
        }, 300);
    }
	//$(content).css('float',( (p) > topOffset2 ) ? 'right' : 'left');


} );


});