$(document).ready(function() { 
    
    //preparing some data :
    var list 		= $('.list-themes li');
    var popup 		= $('#popup');
    var overlay 	= $('#main-view-overlay');
    var mainview 	= $('#show-demo-page');
    var loadingBar 	= $('#mainview-loading-icon');
    var demoView 	= $('#main-content');
    var realHeight 	= $(window).height() - 105;
    
	//add state loading to mainview :
    mainview.addClass('loading-demo');
    
    //set height is full :
    demoView.css('height', realHeight);
    
	$(window).resize(function() {
		var button = $('#btn-panel');
		var currentText = button.text().toLowerCase();
		var realHeight 	= $(window).height() - 105;
		if(currentText == 'hide') {
			var realHeight 	= $(window).height() - 105;
		} else {
			var realHeight  = $(window).height();
		}
		demoView.css('height', realHeight);
	});
	
    //hide popup and overlay layer :
    popup.hide();
    
	$('#tcvn-devices a').each(function(idx, item) {
		$(item).click(function() {
			$('#tcvn-devices a').removeClass('active');
			demoView.attr('class', '');
			demoView.addClass($(this).attr('class'));
			$(this).addClass('active');
		});	
	});
	
    list.each(function(idx, item) {
        var image 	= $(item).find('.hiden-data .demo-img').text();
        var title 	= $(item).find('.hiden-data .demo-title').text();
		var date_s 	= $(item).find('.hiden-data .demo-date-s').text();
        var date 	= $(item).find('.hiden-data .demo-date').text();
        var desc 	= $(item).find('.hiden-data .demo-desc').text();
        var link 	= $(item).find('.hiden-data .demo-link').text();
		var joomla 	= $(item).find('.hiden-data .demo-joomla').text();
		var download 	= $(item).find('.hiden-data .demo-download').text();
        
        //When hover theme name in list :
        $(item).hover(
            function () {
                $('#detail-title').html(title);
                $('#detail-date').html(date);
                $('#detail-image').attr('src', image);
                $('#detail-desc').html(desc);
                $('#loading-icon').css('display', 'block');
                $('#tcvn-image-overlay').css('display', 'block');
                $('#theme-details').css('display', 'block');
            },
            function () {
                $('#theme-details').hide();
            }
        );
        
        //when click theme name in list :
        $(item).click(function(){
            mainview.addClass('loading-demo');
            mainview.attr('src', link);
			$('#tcvn-download a').attr('href', download);
			$('#tcvn-joomla a').attr('href', joomla);
            popup.hide()
            loadingBar.show();
            $('#selectbox-theme').text(date_s + ' - ' + title);
        });
        
    });
    
    //When website demo (iframe) just loaded :
    mainview.load(function() {
        overlay.fadeOut(); 
        loadingBar.hide();        
        mainview.removeClass('loading-demo');
    });
    
    //when click overlay layer (its mean click anywhere out of popup) and demo already loaded :
    overlay.click(function() {
        if(mainview.hasClass('loading-demo') == false) {
            overlay.fadeOut();
            popup.fadeOut();
        }
    });  

    //when click selector and demo already loaded :
    $('#select-theme').click(function() {
        if(mainview.hasClass('loading-demo') == false) {
            popup.fadeToggle();
            overlay.toggle();       
        }
    });        
    
    
    //When image just loaded :
    $('#detail-image').load(function(){
        $('#loading-icon').hide();
        $('#tcvn-image-overlay').fadeOut();
    });
});

function toggleFrame(){
    var button = $('#btn-panel');
    var page = $('#main-content');
    
    var currentHeight = parseInt(page.css('height')); 
    var currentText = button.text().toLowerCase();
    $('#tcvn-frame').slideToggle('slow', function(){
        if(currentText == 'hide') {
            button.text('Show'); 
            page.css('height', parseInt(currentHeight+105)+'px');
        } else {
            button.text('Hide');
            page.css('height', parseInt(currentHeight-105)+'px');
        }
    });
}