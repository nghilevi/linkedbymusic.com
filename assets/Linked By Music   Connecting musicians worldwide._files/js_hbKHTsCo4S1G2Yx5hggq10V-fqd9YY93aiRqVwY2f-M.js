(function ($) {

Drupal.behaviors.initColorbox = {
  attach: function (context, settings) {
    if (!$.isFunction($.colorbox)) {
      return;
    }
    $('.colorbox', context)
      .once('init-colorbox')
      .colorbox(settings.colorbox);
  }
};

{
  $(document).bind('cbox_complete', function () {
    Drupal.attachBehaviors('#cboxLoadedContent');
  });
}

})(jQuery);
;
(function ($) {

Drupal.behaviors.initColorboxDefaultStyle = {
  attach: function (context, settings) {
    $(document).bind('cbox_complete', function () {
      // Only run if there is a title.
      if ($('#cboxTitle:empty', context).length == false) {
        $('#cboxLoadedContent img', context).bind('mouseover', function () {
          $('#cboxTitle', context).slideDown();
        });
        $('#cboxOverlay', context).bind('mouseover', function () {
          $('#cboxTitle', context).slideUp();
        });
      }
      else {
        $('#cboxTitle', context).hide();
      }
    });
  }
};

})(jQuery);
;
/**
 * Provides the ability to fix a html block to a position on the page when the
 * browser is scroled.
 *
 * This code is based on tableheader.js
 */
(function ($) {

Drupal.blockFloatStack = function() {
  if( typeof Drupal.blockFloatStack.blocks == 'undefined' ) {
    Drupal.blockFloatStack.blocks = [];
  }
  return Drupal.blockFloatStack.blocks;
}

/**
 * Attaches the floating_block behavior.
 */
Drupal.behaviors.blockFloat = {
  attach: function (context) {

    var settings = Drupal.settings.floating_block;

    // This breaks in anything less than IE 7. Prevent it from running.
    if ($.browser.msie && parseInt($.browser.version, 10) < 7) {
      return;
    }

    // If this behaviour is being called as part of processing an ajax callback.
    if (jQuery.isFunction(context.parent)) {
      context = context.parent();
    }

    // Cycle through all of the blocks we want to float.
    $.each(settings, function (selector, setting) {
      // The format of a select is [float]|[container] where:
      // [float] is the jQuery selector of thing you want to stay on screen
      // [container] is the jQuery selector of container that defines a boundary
      // not to float outside of.
      $(selector.toString() + ':not(.blockFloat-processed)', context).each(function (j, block) {
        // Store information about the block to float.
        var blockInfo = [];
        blockInfo.original_css = [];
        blockInfo.original_css.left = Drupal.blockFloatCleanCSSValue($(block).css('left'));
        blockInfo.original_css.top = Drupal.blockFloatCleanCSSValue($(block).css('top'));
        blockInfo.original_css.position = $(block).css("position");
        blockInfo.floating = false;
        blockInfo.reset = true;
        blockInfo.original_identifier = 'blockFloat-' +  Drupal.blockFloatStack().length;

        // Store the selector for the container if it exists.
        if (setting.container && $(setting.container.toString()).length > 0) {
          blockInfo.container = setting.container;
        }

        if (setting.padding_top) {
          blockInfo.padding_top = setting.padding_top;
        }
        else {
          blockInfo.padding_top = 0;
        }

        if (setting.padding_bottom) {
          blockInfo.padding_bottom = setting.padding_bottom;
        }
        else {
          blockInfo.padding_bottom = 0;
        }

        // Fix the width of the block as often a block will be 100% of it's
        // container. This ensures that when it's floated it will keep it's
        // original width. There is no point using .css('width') as this will
        // return the computed value so we might as well just set it.
        $(block).width($(block).width());

        // Add class to block to indicate that we're done and give
        // Drupal.blockFloatTracker a certain way to identify the block.
        $(block).addClass('blockFloat-processed ' + blockInfo.original_identifier);

        // If the page loaded has already been scrolled calling
        // Drupal.blockFloatTracker will float the block if necessary.
        Drupal.blockFloatTracker(blockInfo);

        // Store the block in the floating_blocks array.
        Drupal.blockFloatStack().push(blockInfo);
      });
    });
  }
}

/**
 * Function that calculates whether or not the block should be floated.
 */
Drupal.blockFloatTracker = function (blockInfo) {
  // Save positioning data.
  var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  var block = $('.' + blockInfo.original_identifier);
  if (block.length == 0) {
    // The floated block must have been removed from the page - do nothing.
    return;
  }

  // (Re)calculate some values if necessary.
  if (blockInfo.scrollHeight != scrollHeight || blockInfo.reset) {
    if (blockInfo.reset) {
      // Reset block so we can calculate new offset.
      Drupal.blockFloatResetPosition(block, blockInfo);
      blockInfo.original_offset = $(block).offset();

      // Reset completed - set value so we don't do unnecessary resets.
      blockInfo.reset = false;
    }

    // Save the scrollHeight - if this changes we will need to recalculate.
    blockInfo.scrollHeight = scrollHeight;
    // The minimum offset is always defined by the blocks starting position.
    blockInfo.minOffset = blockInfo.original_offset.top - blockInfo.padding_top;

    // Calulate the maxOffset which depends on whether or not a container is
    // defined. Otherwise use the scrollHeight.
    if (blockInfo.container) {
      blockInfo.maxOffset = $(blockInfo.container).height() + $(blockInfo.container).offset().top - blockInfo.padding_bottom;
    }
    else {
      blockInfo.maxOffset = scrollHeight;
    }
  }

  // Track positioning relative to the viewport and set position.
  var vScroll = (document.documentElement.scrollTop || document.body.scrollTop);
  if (vScroll > blockInfo.minOffset) {
    var topPosition = blockInfo.padding_top;
    // Block height can change if there a collapsible fields etc... inside the
    // block so recalculate everytime we are floating the block.
    var blockHeight = block.height();
    // Don't let the bottom of the block go beneath maxOffset.
    if ((vScroll + blockHeight) > blockInfo.maxOffset) {
      // At this point topPosition will become a negative number to keep the
      // block from going out of the defined container.
      topPosition = blockInfo.maxOffset - vScroll - blockHeight;
    }

    block.css({
      left:  blockInfo.original_offset.left + 'px',
      position: 'fixed',
      top: topPosition + 'px'
    }).addClass('floating-block-active');

    blockInfo.floating = true;
  }
  else {
    // Put the block back in it's original postion
    Drupal.blockFloatResetPosition(block, blockInfo);
  }
}

/**
 * Resets the position of a floated block back to non floated position.
 */
Drupal.blockFloatResetPosition = function (block, blockInfo) {
  if (blockInfo.floating) {
    block.css({
      left: blockInfo.original_css.left,
      position: blockInfo.original_css.position,
      top: blockInfo.original_css.top
    }).removeClass('floating-block-active');
    blockInfo.floating = false;
  }
}

/**
 * If the css value is 0px for top and left then it is not actually set using
 * CSS - this will be the computed value. Setting to a blank string will ensure
 * that when Drupal.blockFloatResetPosition is called these css value will be
 * unset.
 */
Drupal.blockFloatCleanCSSValue = function (cssvalue) {
  if (cssvalue == '0px') {
    cssvalue = '';
  }
  return cssvalue;
}

/**
 * Callback to be added to the scroll event. Each time the user scrolls this
 * function will be called.
 */
Drupal.blockFloatOnScroll = function() {
  $(Drupal.blockFloatStack()).each(function () {
    Drupal.blockFloatTracker(this);
  });
};

/**
 * Callback to be added to the resize event. Each time the user resizes the
 * this window this function will be called. A timeout is used to prevent
 * this function from causing a slow down during resizing.
 */
Drupal.blockFloatWindowResize = function() {
  if( typeof Drupal.blockFloatWindowResize.timer == 'undefined' ) {
    Drupal.blockFloatWindowResize.timer = false;
  }
  // Ensure minimum time between adjustments.
  if (Drupal.blockFloatWindowResize.timer) {
    return;
  }
  Drupal.blockFloatWindowResize.timer = setTimeout(function () {
    $(Drupal.blockFloatStack()).each(function () {
      this.reset = true;
      Drupal.blockFloatTracker(this);
    });
    // Reset timer
    Drupal.blockFloatWindowResize.timer = false;
  }, 250);
};

/**
 * Attach callbacks to resize and scroll events. Add a class to the body to
 * prevent doing this multiple times.
 */
if (!$('body').hasClass('blockFloat-processed')) {
  $('body').addClass('blockFloat-processed');
  $(window).scroll(Drupal.blockFloatOnScroll);
  $(document.documentElement).scroll(Drupal.blockFloatOnScroll);
  $(window).resize(Drupal.blockFloatWindowResize);
}

})(jQuery);
;

(function ($) {
  Drupal.Panels = Drupal.Panels || {};

  Drupal.Panels.autoAttach = function() {
    if ($.browser.msie) {
      // If IE, attach a hover event so we can see our admin links.
      $("div.panel-pane").hover(
        function() {
          $('div.panel-hide', this).addClass("panel-hide-hover"); return true;
        },
        function() {
          $('div.panel-hide', this).removeClass("panel-hide-hover"); return true;
        }
      );
      $("div.admin-links").hover(
        function() {
          $(this).addClass("admin-links-hover"); return true;
        },
        function(){
          $(this).removeClass("admin-links-hover"); return true;
        }
      );
    }
  };

  $(Drupal.Panels.autoAttach);
})(jQuery);
;
/**
* hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*/
(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind("mousemove",track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type=="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).bind("mousemove",track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).unbind("mousemove",track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover)}})(jQuery);;
/* Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version 2.1.2
 */
(function(a){a.fn.bgiframe=(a.browser.msie&&/msie 6\.0/i.test(navigator.userAgent)?function(d){d=a.extend({top:"auto",left:"auto",width:"auto",height:"auto",opacity:true,src:"javascript:false;"},d);var c='<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+d.src+'"style="display:block;position:absolute;z-index:-1;'+(d.opacity!==false?"filter:Alpha(Opacity='0');":"")+"top:"+(d.top=="auto"?"expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+'px')":b(d.top))+";left:"+(d.left=="auto"?"expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+'px')":b(d.left))+";width:"+(d.width=="auto"?"expression(this.parentNode.offsetWidth+'px')":b(d.width))+";height:"+(d.height=="auto"?"expression(this.parentNode.offsetHeight+'px')":b(d.height))+';"/>';return this.each(function(){if(a(this).children("iframe.bgiframe").length===0){this.insertBefore(document.createElement(c),this.firstChild)}})}:function(){return this});a.fn.bgIframe=a.fn.bgiframe;function b(c){return c&&c.constructor===Number?c+"px":c}})(jQuery);;
/*
 * Superfish v1.4.8 - jQuery menu widget
 * Copyright (c) 2008 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 * CHANGELOG: http://users.tpg.com.au/j_birch/plugins/superfish/changelog.txt
 */
/*
 * This is not the original jQuery Supersubs plugin.
 * Please refer to the README for more information.
 */

(function($){
  $.fn.superfish = function(op){
    var sf = $.fn.superfish,
      c = sf.c,
      $arrow = $(['<span class="',c.arrowClass,'"> &#187;</span>'].join('')),
      over = function(){
        var $$ = $(this), menu = getMenu($$);
        clearTimeout(menu.sfTimer);
        $$.showSuperfishUl().siblings().hideSuperfishUl();
      },
      out = function(){
        var $$ = $(this), menu = getMenu($$), o = sf.op;
        clearTimeout(menu.sfTimer);
        menu.sfTimer=setTimeout(function(){
          o.retainPath=($.inArray($$[0],o.$path)>-1);
          $$.hideSuperfishUl();
          if (o.$path.length && $$.parents(['li.',o.hoverClass].join('')).length<1){over.call(o.$path);}
        },o.delay);
      },
      getMenu = function($menu){
        var menu = $menu.parents(['ul.',c.menuClass,':first'].join(''))[0];
        sf.op = sf.o[menu.serial];
        return menu;
      },
      addArrow = function($a){ $a.addClass(c.anchorClass).append($arrow.clone()); };

    return this.each(function() {
      var s = this.serial = sf.o.length;
      var o = $.extend({},sf.defaults,op);
      o.$path = $('li.'+o.pathClass,this).slice(0,o.pathLevels).each(function(){
        $(this).addClass([o.hoverClass,c.bcClass].join(' '))
          .filter('li:has(ul)').removeClass(o.pathClass);
      });
      sf.o[s] = sf.op = o;

      $('li:has(ul)',this)[($.fn.hoverIntent && !o.disableHI) ? 'hoverIntent' : 'hover'](over,out).each(function() {
        if (o.autoArrows) addArrow( $('>a:first-child',this) );
      })
      .not('.'+c.bcClass)
        .hideSuperfishUl();

      var $a = $('a',this);
      $a.each(function(i){
        var $li = $a.eq(i).parents('li');
        $a.eq(i).focus(function(){over.call($li);}).blur(function(){out.call($li);});
      });
      o.onInit.call(this);

    }).each(function() {
      var menuClasses = [c.menuClass];
      if (sf.op.dropShadows  && !($.browser.msie && $.browser.version < 7)) menuClasses.push(c.shadowClass);
      $(this).addClass(menuClasses.join(' '));
    });
  };

  var sf = $.fn.superfish;
  sf.o = [];
  sf.op = {};
  sf.IE7fix = function(){
    var o = sf.op;
    if ($.browser.msie && $.browser.version > 6 && o.dropShadows && o.animation.opacity!=undefined)
      this.toggleClass(sf.c.shadowClass+'-off');
    };
  sf.c = {
    bcClass: 'sf-breadcrumb',
    menuClass: 'sf-js-enabled',
    anchorClass: 'sf-with-ul',
    arrowClass: 'sf-sub-indicator',
    shadowClass: 'sf-shadow'
  };
  sf.defaults = {
    hoverClass: 'sfHover',
    pathClass: 'overideThisToUse',
    pathLevels: 1,
    delay: 800,
    animation: {opacity:'show'},
    speed: 'normal',
    autoArrows: true,
    dropShadows: true,
    disableHI: false, // true disables hoverIntent detection
    onInit: function(){}, // callback functions
    onBeforeShow: function(){},
    onShow: function(){},
    onHide: function(){}
  };
  $.fn.extend({
    hideSuperfishUl : function(){
      var o = sf.op,
        not = (o.retainPath===true) ? o.$path : '';
      o.retainPath = false;
      var $ul = $(['li.',o.hoverClass].join(''),this).add(this).not(not).removeClass(o.hoverClass)
          .find('>ul').css({top: '-99999em'}).addClass('sf-hidden');
      o.onHide.call($ul);
      return this;
    },
    showSuperfishUl : function(){
      var o = sf.op,
        sh = sf.c.shadowClass+'-off',
        $ul = this.addClass(o.hoverClass)
          .find('>ul.sf-hidden').css({display: 'none', top: ''}).removeClass('sf-hidden');
      sf.IE7fix.call($ul);
      o.onBeforeShow.call($ul);
      $ul.animate(o.animation,o.speed,function(){ sf.IE7fix.call($ul); o.onShow.call($ul); });
      return this;
    }
  });
})(jQuery);;
/*
 * Supersubs v0.2b - jQuery plugin
 * Copyright (c) 2008 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 * This plugin automatically adjusts submenu widths of suckerfish-style menus to that of
 * their longest list item children. If you use this, please expect bugs and report them
 * to the jQuery Google Group with the word 'Superfish' in the subject line.
 *
 */
/*
 * This is not the original jQuery Supersubs plugin.
 * Please refer to the README for more information.
 */

(function($){ // $ will refer to jQuery within this closure
  $.fn.supersubs = function(options){
    var opts = $.extend({}, $.fn.supersubs.defaults, options);
    // return original object to support chaining
    return this.each(function() {
      // cache selections
      var $$ = $(this);
      // support metadata
      var o = $.meta ? $.extend({}, opts, $$.data()) : opts;
      // get the font size of menu.
      // .css('fontSize') returns various results cross-browser, so measure an em dash instead
      var fontsize = $('<li id="menu-fontsize">&#8212;</li>').css({
        'padding' : 0,
        'position' : 'absolute',
        'top' : '-99999em',
        'width' : 'auto'
      }).appendTo($$).width(); //clientWidth is faster, but was incorrect here
      // remove em dash
      $('#menu-fontsize').remove();

      // Jump on level if it's a "NavBar"
      if ($$.hasClass('sf-navbar')) {
        $$ = $('li > ul', $$);
      }
      // cache all ul elements 
      $ULs = $$.find('ul:not(.sf-megamenu)');
      // loop through each ul in menu
      $ULs.each(function(i) {
        // cache this ul
        var $ul = $ULs.eq(i);
        // get all (li) children of this ul
        var $LIs = $ul.children();
        // get all anchor grand-children
        var $As = $LIs.children('a');
        // force content to one line and save current float property
        var liFloat = $LIs.css('white-space','nowrap').css('float');
        // remove width restrictions and floats so elements remain vertically stacked
        var emWidth = $ul.add($LIs).add($As).css({
          'float' : 'none',
          'width'  : 'auto'
        })
        // this ul will now be shrink-wrapped to longest li due to position:absolute
        // so save its width as ems. Clientwidth is 2 times faster than .width() - thanks Dan Switzer
        .end().end()[0].clientWidth / fontsize;
        // add more width to ensure lines don't turn over at certain sizes in various browsers
        emWidth += o.extraWidth;
        // restrict to at least minWidth and at most maxWidth
        if (emWidth > o.maxWidth)    { emWidth = o.maxWidth; }
        else if (emWidth < o.minWidth)  { emWidth = o.minWidth; }
        emWidth += 'em';
        // set ul to width in ems
        $ul.css('width',emWidth);
        // restore li floats to avoid IE bugs
        // set li width to full width of this ul
        // revert white-space to normal
        $LIs.css({
          'float' : liFloat,
          'width' : '100%',
          'white-space' : 'normal'
        })
        // update offset position of descendant ul to reflect new width of parent
        .each(function(){
          var $childUl = $('>ul',this);
          var offsetDirection = $childUl.css('left')!==undefined ? 'left' : 'right';
          $childUl.css(offsetDirection,emWidth);
        });
      });
    });
  };
  // expose defaults
  $.fn.supersubs.defaults = {
    minWidth: 9, // requires em unit.
    maxWidth: 25, // requires em unit.
    extraWidth: 0 // extra width can ensure lines don't sometimes turn over due to slight browser differences in how they round-off values
  };
})(jQuery); // plugin code ends;
/*
 * Supposition v0.2 - an optional enhancer for Superfish jQuery menu widget.
 *
 * Copyright (c) 2008 Joel Birch - based mostly on work by Jesse Klaasse and credit goes largely to him.
 * Special thanks to Karl Swedberg for valuable input.
 *
 * Dual licensed under the MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 */
/*
 * This is not the original jQuery Supersubs plugin.
 * Please refer to the README for more information.
 */

(function($){
  $.fn.supposition = function(){
    var $w = $(window), /*do this once instead of every onBeforeShow call*/
    _offset = function(dir) {
      return window[dir == 'y' ? 'pageYOffset' : 'pageXOffset']
      || document.documentElement && document.documentElement[dir=='y' ? 'scrollTop' : 'scrollLeft']
      || document.body[dir=='y' ? 'scrollTop' : 'scrollLeft'];
    },
    onHide = function(){
      this.css({bottom:''});
    },
    onBeforeShow = function(){
      this.each(function(){
        var $u = $(this);
        $u.css('display','block');
        var menuWidth = $u.width(),
        menuParentWidth = $u.closest('li').outerWidth(true),
        menuParentLeft = $u.closest('li').offset().left,
        totalRight = $w.width() + _offset('x'),
        menuRight = $u.offset().left + menuWidth,
        exactMenuWidth = (menuRight > (menuParentWidth + menuParentLeft)) ? menuWidth - (menuRight - (menuParentWidth + menuParentLeft)) : menuWidth;  
        if ($u.parents('.sf-js-enabled').hasClass('rtl')) {
          if (menuParentLeft < exactMenuWidth) {
            $u.css('left', menuParentWidth + 'px');
            $u.css('right', 'auto');
          }
        }
        else {
          if (menuRight > totalRight && menuParentLeft > menuWidth) {
            $u.css('right', menuParentWidth + 'px');
            $u.css('left', 'auto');
          }
        }
        var windowHeight = $w.height(),
        offsetTop = $u.offset().top,
        menuParentShadow = ($u.closest('.sf-menu').hasClass('sf-shadow') && $u.css('padding-bottom').length > 0) ? parseInt($u.css('padding-bottom').slice(0,-2)) : 0,
        menuParentHeight = ($u.closest('.sf-menu').hasClass('sf-vertical')) ? '-' + menuParentShadow : $u.parent().outerHeight(true) - menuParentShadow,
        menuHeight = $u.height(),
        baseline = windowHeight + _offset('y');
        var expandUp = ((offsetTop + menuHeight > baseline) && (offsetTop > menuHeight));
        if (expandUp) {
          $u.css('bottom', menuParentHeight + 'px');
          $u.css('top', 'auto');
        }
        $u.css('display','none');
      });
    };

    return this.each(function() {
      var o = $.fn.superfish.o[this.serial]; /* get this menu's options */

      /* if callbacks already set, store them */
      var _onBeforeShow = o.onBeforeShow,
      _onHide = o.onHide;

      $.extend($.fn.superfish.o[this.serial],{
        onBeforeShow: function() {
          onBeforeShow.call(this); /* fire our Supposition callback */
          _onBeforeShow.call(this); /* fire stored callbacks */
        },
        onHide: function() {
          onHide.call(this); /* fire our Supposition callback */
          _onHide.call(this); /* fire stored callbacks */
        }
      });
    });
  };
})(jQuery);;
/*
 * sf-Touchscreen v1.0b - Provides touchscreen compatibility for the jQuery Superfish plugin.
 *
 * Developer's note:
 * Built as a part of the Superfish project for Drupal (http://drupal.org/project/superfish) 
 * Found any bug? have any cool ideas? contact me right away! http://drupal.org/user/619294/contact
 *
 * jQuery version: 1.3.x or higher.
 *
 * Dual licensed under the MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 */

(function($){
  $.fn.sftouchscreen = function() {
    // Return original object to support chaining.
    return this.each( function() {
      // Select hyperlinks from parent menu items.
      $(this).find('li > ul').closest('li').children('a').each( function() {
        var $item = $(this);
        // No .toggle() here as it's not possible to reset it.
        $item.click( function(event){
          // Already clicked? proceed to the URI.
          if ($item.hasClass('sf-clicked')) {
            var $uri = $item.attr('href');
            window.location = $uri;
          }
          else {
            event.preventDefault();
            $item.addClass('sf-clicked');
          }
        }).closest('li').mouseleave( function(){
          // So, we reset everything.
          $item.removeClass('sf-clicked');
        });
      });
    });
  };
})(jQuery);;
/**
 * @file
 * Some basic behaviors and utility functions for Views.
 */
(function ($) {

Drupal.Views = {};

/**
 * jQuery UI tabs, Views integration component
 */
Drupal.behaviors.viewsTabs = {
  attach: function (context) {
    if ($.viewsUi && $.viewsUi.tabs) {
      $('#views-tabset').once('views-processed').viewsTabs({
        selectedClass: 'active'
      });
    }

    $('a.views-remove-link').once('views-processed').click(function(event) {
      var id = $(this).attr('id').replace('views-remove-link-', '');
      $('#views-row-' + id).hide();
      $('#views-removed-' + id).attr('checked', true);
      event.preventDefault();
   });
  /**
    * Here is to handle display deletion
    * (checking in the hidden checkbox and hiding out the row)
    */
  $('a.display-remove-link')
    .addClass('display-processed')
    .click(function() {
      var id = $(this).attr('id').replace('display-remove-link-', '');
      $('#display-row-' + id).hide();
      $('#display-removed-' + id).attr('checked', true);
      return false;
  });
  }
};

/**
 * Helper function to parse a querystring.
 */
Drupal.Views.parseQueryString = function (query) {
  var args = {};
  var pos = query.indexOf('?');
  if (pos != -1) {
    query = query.substring(pos + 1);
  }
  var pairs = query.split('&');
  for(var i in pairs) {
    if (typeof(pairs[i]) == 'string') {
      var pair = pairs[i].split('=');
      // Ignore the 'q' path argument, if present.
      if (pair[0] != 'q' && pair[1]) {
        args[decodeURIComponent(pair[0].replace(/\+/g, ' '))] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
      }
    }
  }
  return args;
};

/**
 * Helper function to return a view's arguments based on a path.
 */
Drupal.Views.parseViewArgs = function (href, viewPath) {
  var returnObj = {};
  var path = Drupal.Views.getPath(href);
  // Ensure we have a correct path.
  if (viewPath && path.substring(0, viewPath.length + 1) == viewPath + '/') {
    var args = decodeURIComponent(path.substring(viewPath.length + 1, path.length));
    returnObj.view_args = args;
    returnObj.view_path = path;
  }
  return returnObj;
};

/**
 * Strip off the protocol plus domain from an href.
 */
Drupal.Views.pathPortion = function (href) {
  // Remove e.g. http://example.com if present.
  var protocol = window.location.protocol;
  if (href.substring(0, protocol.length) == protocol) {
    // 2 is the length of the '//' that normally follows the protocol
    href = href.substring(href.indexOf('/', protocol.length + 2));
  }
  return href;
};

/**
 * Return the Drupal path portion of an href.
 */
Drupal.Views.getPath = function (href) {
  href = Drupal.Views.pathPortion(href);
  href = href.substring(Drupal.settings.basePath.length, href.length);
  // 3 is the length of the '?q=' added to the url without clean urls.
  if (href.substring(0, 3) == '?q=') {
    href = href.substring(3, href.length);
  }
  var chars = ['#', '?', '&'];
  for (i in chars) {
    if (href.indexOf(chars[i]) > -1) {
      href = href.substr(0, href.indexOf(chars[i]));
    }
  }
  return href;
};

})(jQuery);
;
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
/**
 * @file
 * Handles AJAX fetching of views, including filter submission and response.
 */
(function ($) {

/**
 * Attaches the AJAX behavior to Views exposed filter forms and key View links.
 */
Drupal.behaviors.ViewsAjaxView = {};
Drupal.behaviors.ViewsAjaxView.attach = function() {
  if (Drupal.settings && Drupal.settings.views && Drupal.settings.views.ajaxViews) {
    $.each(Drupal.settings.views.ajaxViews, function(i, settings) {
      Drupal.views.instances[i] = new Drupal.views.ajaxView(settings);
    });
  }
};

Drupal.views = {};
Drupal.views.instances = {};

/**
 * Javascript object for a certain view.
 */
Drupal.views.ajaxView = function(settings) {
  var selector = '.view-dom-id-' + settings.view_dom_id;
  this.$view = $(selector);

  // Retrieve the path to use for views' ajax.
  var ajax_path = Drupal.settings.views.ajax_path;

  // If there are multiple views this might've ended up showing up multiple times.
  if (ajax_path.constructor.toString().indexOf("Array") != -1) {
    ajax_path = ajax_path[0];
  }

  // Check if there are any GET parameters to send to views.
  var queryString = window.location.search || '';
  if (queryString !== '') {
    // Remove the question mark and Drupal path component if any.
    var queryString = queryString.slice(1).replace(/q=[^&]+&?|&?render=[^&]+/, '');
    if (queryString !== '') {
      // If there is a '?' in ajax_path, clean url are on and & should be used to add parameters.
      queryString = ((/\?/.test(ajax_path)) ? '&' : '?') + queryString;
    }
  }

  this.element_settings = {
    url: ajax_path + queryString,
    submit: settings,
    setClick: true,
    event: 'click',
    selector: selector,
    progress: { type: 'throbber' }
  };

  this.settings = settings;

  // Add the ajax to exposed forms.
  this.$exposed_form = $('form#views-exposed-form-'+ settings.view_name.replace(/_/g, '-') + '-' + settings.view_display_id.replace(/_/g, '-'));
  this.$exposed_form.once(jQuery.proxy(this.attachExposedFormAjax, this));

  // Add the ajax to pagers.
  this.$view
    // Don't attach to nested views. Doing so would attach multiple behaviors
    // to a given element.
    .filter(jQuery.proxy(this.filterNestedViews, this))
    .once(jQuery.proxy(this.attachPagerAjax, this));
};

Drupal.views.ajaxView.prototype.attachExposedFormAjax = function() {
  var button = $('input[type=submit], button[type=submit], input[type=image]', this.$exposed_form);
  button = button[0];

  this.exposedFormAjax = new Drupal.ajax($(button).attr('id'), button, this.element_settings);
};

Drupal.views.ajaxView.prototype.filterNestedViews= function() {
  // If there is at least one parent with a view class, this view
  // is nested (e.g., an attachment). Bail.
  return !this.$view.parents('.view').size();
};

/**
 * Attach the ajax behavior to each link.
 */
Drupal.views.ajaxView.prototype.attachPagerAjax = function() {
  this.$view.find('ul.pager > li > a, th.views-field a, .attachment .views-summary a')
  .each(jQuery.proxy(this.attachPagerLinkAjax, this));
};

/**
 * Attach the ajax behavior to a singe link.
 */
Drupal.views.ajaxView.prototype.attachPagerLinkAjax = function(id, link) {
  var $link = $(link);
  var viewData = {};
  var href = $link.attr('href');
  // Construct an object using the settings defaults and then overriding
  // with data specific to the link.
  $.extend(
    viewData,
    this.settings,
    Drupal.Views.parseQueryString(href),
    // Extract argument data from the URL.
    Drupal.Views.parseViewArgs(href, this.settings.view_base_path)
  );

  // For anchor tags, these will go to the target of the anchor rather
  // than the usual location.
  $.extend(viewData, Drupal.Views.parseViewArgs(href, this.settings.view_base_path));

  this.element_settings.submit = viewData;
  this.pagerAjax = new Drupal.ajax(false, $link, this.element_settings);
};

Drupal.ajax.prototype.commands.viewsScrollTop = function (ajax, response, status) {
  // Scroll to the top of the view. This will allow users
  // to browse newly loaded content after e.g. clicking a pager
  // link.
  var offset = $(response.selector).offset();
  // We can't guarantee that the scrollable object should be
  // the body, as the view could be embedded in something
  // more complex such as a modal popup. Recurse up the DOM
  // and scroll the first element that has a non-zero top.
  var scrollTarget = response.selector;
  while ($(scrollTarget).scrollTop() == 0 && $(scrollTarget).parent()) {
    scrollTarget = $(scrollTarget).parent();
  }
  // Only scroll upward
  if (offset.top - 10 < $(scrollTarget).scrollTop()) {
    $(scrollTarget).animate({scrollTop: (offset.top - 10)}, 500);
  }
};

})(jQuery);
;
