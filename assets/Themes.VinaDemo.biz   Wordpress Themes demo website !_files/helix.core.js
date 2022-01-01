jQuery(function($){

	//Goto Top
	$('.sp-totop').click(function(event) {
		 event.preventDefault();
		 $('html, body').animate({
			 scrollTop: $("body").offset().top
		 }, 500);
	});	
	//End goto top

});
jQuery(document).ready(function($)
{
    $(window).load(function()
    {
    	$window = $(window),
		$content =$("#content"),
		$header = $("#sp-header-wrapper"),
		contentwidth =$content.width(), 
		headerHeight = $header.height(),
		$header.css('top', 0);
		$content.css('padding-top', headerHeight-1)
	});
});