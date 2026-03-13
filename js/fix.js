console.log('🚀 fix.js is loading...');
// ===== GLOBAL FIXES =====
jQuery(document).ready(function ($) {
    console.log('🔧 Global fix ready function firing');

    // Hide header and footer if loaded inside an iframe (like on article.html)
    if (window.self !== window.top) {
        $('.mainHeader, .btSiteFooter, .btVerticalHeaderTop, .btVerticalMenuTrigger').attr('style', 'display: none !important');
        $('body').addClass('is-iframe');
    }

    // Fix 1: Reset any negative offsets (like the -915px gap)
    function resetOffsets() {
        if ($(window).width() > 991) return; // Do not strip offsets on Desktop

        $('.btPageWrap, .btContentWrap, .btContentHolder, .btContent, .bt_bb_section').css({
            'transform': 'none',
            'margin-top': '0',
            'padding-top': '0',
            'position': 'relative',
            'top': '0'
        });
        // Specifically target the first section
        $('section.bt_bb_section').first().css({
            'margin-top': '0',
            'padding-top': '0',
            'transform': 'none'
        });
    }

    // Fix 2: Reliable single-trigger mobile menu with dedicated panel back button
    function fixMobileMenu() {
        console.log('📱 Initializing clean mobile menu');

        // *** DESKTOP GUARD: On desktop, let theme handle the menu natively ***
        // Only rename triggers and inject custom UI on mobile
        if (window.innerWidth >= 1200) {
            // On desktop: ensure the 'on' class is NOT stuck
            $('body').removeClass('btMenuVerticalOn btShowMenu btMobileMenuOpen btHideMenu');
            $('.btBelowLogoArea').removeClass('btMobileMenuOpen');
            $('.menuPort nav > ul > li').removeClass('on');
            // Make sure sub-menus are not inlined hidden
            $('.menuPort nav > ul > li > .sub-menu').css('display', '');

            // Prevent parent menu items with href="#" from getting stuck when clicked on desktop
            $('.menuPort nav > ul > li.menu-item-has-children > a').off('click.desktopfix').on('click.desktopfix', function (e) {
                if ($(this).attr('href') === '#' || !$(this).attr('href')) {
                    e.preventDefault();
                    $(this).closest('li').toggleClass('on');
                    return false;
                }
            });
            return;
        }

        // 1. NEUTRALIZE theme triggers to stop theme JS from interfering
        // We rename the classes so theme JS doesn't find them, but we keep styling if possible
        $('.btHorizontalMenuTrigger, .btVerticalMenuTrigger').each(function () {
            if (!$(this).hasClass('customHandled')) {
                $(this).addClass('customMenuTrigger customHandled').removeClass('btHorizontalMenuTrigger btVerticalMenuTrigger');
            }
        });

        // Inject sub-menu togglers for parent items (mobile only)
        $('.menu-item-has-children').each(function () {
            if (!$(this).find('> .subToggler').length) {
                $(this).append('<span class="subToggler" style="position:absolute; right:13px; top:0; height:44px; width:44px; cursor:pointer; z-index:10; display:flex; align-items:center; justify-content:center; border-radius:30px;"></span>');
            }
        });

        // 2. AGGRESSIVE NUKE for any "X" icons and theme close buttons
        function nukeThemeClose() {
            // Remove known close button classes
            $('.btCloseVertical, .btCloseHorizontal, .btCloseMenu, .btSearchInnerClose').remove();

            // Remove ANY element with data-ico-fa set to "X" (\uf00d)
            $('[data-ico-fa*="f00d"]').remove();
            $('[data-ico-fa*="&#xf00d;"]').remove();

            // Check for specific theme icon structures that might be re-injected
            $('.bt_bb_icon_holder').each(function () {
                var ico = $(this).attr('data-ico-fa') || '';
                if (ico.indexOf('f00d') !== -1) {
                    $(this).closest('.bt_bb_icon').remove();
                }
            });

            // Also remove any stray "X" marks that are hardcoded or injected without attributes
            $('.btVerticalMenuHolder .bt_bb_icon, .btBelowLogoArea .bt_bb_icon').each(function () {
                // If it's not a subToggler or my back button, and it looks like an X in pseudo-content
                // but for now let's just target the common ones
            });
        }

        nukeThemeClose();
        setInterval(nukeThemeClose, 500); // More frequent nuking

        // Inject dedicated BACK button into the menu panel if not exists
        if (!$('.btBelowLogoArea .btCustomMobileBack').length) {
            $('.btBelowLogoArea').prepend('<div class="btCustomMobileBack"><span></span></div>');
        }

        // --- Close/open helpers ---
        function closeMenu() {
            $('body').removeClass('btMenuVerticalOn btShowMenu btMobileMenuOpen btHideMenu');
            $('.btBelowLogoArea').removeClass('btMobileMenuOpen');
            // Ensure trigger is visible again
            $('.customMenuTrigger').show();
            console.log('✅ Menu CLOSED');
        }
        function openMenu() {
            $('body').addClass('btMenuVerticalOn btShowMenu btMobileMenuOpen');
            $('.btBelowLogoArea').addClass('btMobileMenuOpen');
            // Hide the original trigger so it doesn't show as 3 bars or X
            $('.customMenuTrigger').hide();
            console.log('✅ Menu OPENED');
            nukeThemeClose();
        }

        // Remove ALL previous jQuery handlers
        $(document).off('click.mobilefix click.closefix click.linkfix click.subfix click.customback click.triggerfix click.subfixtoggle');

        // Robust delegated handler for ALL triggers
        $(document).on('click.triggerfix', '.customMenuTrigger, .btHorizontalMenuTrigger, .btVerticalMenuTrigger', function (e) {
            if (window.innerWidth >= 1200) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            openMenu();
            return false;
        });

        // Custom back button click
        $(document).on('click.customback', '.btCustomMobileBack', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            closeMenu();
            return false;
        });

        // Fallback for any theme close buttons that escape the nuke
        $(document).on('click.closefix', '.btCloseVertical, .btCloseHorizontal, .btCloseMenu', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            closeMenu();
            return false;
        });

        // Prevent parent menu items with href="#" from navigating, but still open submenus on mobile
        $(document).on('click.linkfix', '.mainHeader nav > ul > li.menu-item-has-children > a', function (e) {
            if (window.innerWidth > 991) return;
            var $a = $(this);
            var $li = $a.closest('li');
            if ($li.hasClass('menu-item-has-children') && ($a.attr('href') === '#' || !$a.attr('href'))) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                $li.find('> .subToggler').trigger('click');
                return false;
            }
            closeMenu();
        });

        // Close menu on nav link click (for non-parent items or items with valid href)
        $(document).on('click.linkfix', '.mainHeader nav ul li:not(.menu-item-has-children) a, .mainHeader nav ul li.menu-item-has-children a[href!="#"][href]', function (e) {
            if ($(window).width() > 991) return;
            closeMenu();
        });

        // Submenu toggling (mobile only) - Delegated binding with tough propagation stopping
        $(document).on('click.subfixtoggle', '.subToggler', function (e) {
            if (window.innerWidth > 991) return; // Skip on desktop
            e.preventDefault();
            e.stopPropagation(); // VERY IMPORTANT: Stop event before it bubbles to parent LI where theme listens!
            e.stopImmediatePropagation();
            
            var $li = $(this).closest('li');
            var $ul = $li.find('> ul').first();
            
            if ($li.hasClass('on')) {
                $li.removeClass('on');
                $ul.stop(true, true).slideUp(200);
            } else {
                $li.addClass('on');
                $ul.stop(true, true).slideDown(200);
            }
            return false;
        });
    }
    // Run fixes
    resetOffsets();
    fixMobileMenu();
    $('body').removeClass('btMenuVerticalOn btShowMenu btMobileMenuOpen btHideMenu');
    $('.btBelowLogoArea').removeClass('btMobileMenuOpen');

    // Run again after a delay to catch any late-loading scripts
    setTimeout(resetOffsets, 500);
    setTimeout(fixMobileMenu, 500);
    setTimeout(resetOffsets, 1000);

    // Run on resize
    $(window).on('resize', function () {
        resetOffsets();
        fixMobileMenu();
    });
});// ===== ULTIMATE HEADER GAP FIX - AGGRESSIVE APPROACH =====
// Add this to your fix.js file

jQuery(document).ready(function ($) {
    console.log('🔧 Ultimate gap fix loaded');

    function removeAllGaps() {
        // Get the actual positions
        var header = $('.mainHeader');
        var firstSection = $('.btPageHeadline, section.bt_bb_section:first-of-type, #bt_bb_section69a657de5caaa').first();

        if (!header.length || !firstSection.length) return;

        // Calculate the gap
        var headerBottom = header.offset().top + header.outerHeight();
        var sectionTop = firstSection.offset().top;
        var gap = sectionTop - headerBottom;

        console.log('📏 Header bottom:', headerBottom, 'Section top:', sectionTop, 'Gap:', gap);

        if ($(window).width() > 991) return; // Do not strip offsets on Desktop

        // Remove ANY padding/margin from ALL possible sources
        $('.btContentWrap, .btContentHolder, .btContent, .bt_bb_wrapper, .btPageWrap').css({
            'padding-top': '0',
            'margin-top': '0',
            'transform': 'none',
            'position': 'relative',
            'top': '0'
        });

        // Remove the specific problematic transform
        $('.bt_bb_wrapper').css('transform', 'none');

        // If there's still a gap, force the first section up
        if (gap > 5) {
            firstSection.css({
                'margin-top': '-' + (gap) + 'px',
                'position': 'relative',
                'top': '0'
            });
            console.log('✅ Applied negative margin:', -gap);
        }

        // Check if there's any inline padding from JavaScript
        $('[style*="padding-top"]').each(function () {
            var currentPadding = parseInt($(this).css('padding-top'));
            if (currentPadding > 0) {
                $(this).css('padding-top', '0');
                console.log('✅ Removed padding from:', this);
            }
        });
    }

    // Run multiple times at different intervals
    removeAllGaps();
    setTimeout(removeAllGaps, 100);
    setTimeout(removeAllGaps, 300);
    setTimeout(removeAllGaps, 500);
    setTimeout(removeAllGaps, 1000);
    setTimeout(removeAllGaps, 2000);

    // Run on resize and orientation change
    $(window).on('resize orientationchange', function () {
        setTimeout(removeAllGaps, 50);
    });

    // Run after all images and content load
    $(window).on('load', function () {
        setTimeout(removeAllGaps, 100);
        setTimeout(removeAllGaps, 500);
    });

    // Watch for any style changes
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'style') {
                var target = $(mutation.target);
                if (target.css('padding-top') !== '0px' || target.css('margin-top') !== '0px') {
                    removeAllGaps();
                }
            }
        });
    });

    // Observe the main containers (omitting wrapper to protect footers)
    $('.btContentWrap, .btContentHolder, .btContent').each(function () {
        observer.observe(this, { attributes: true, attributeFilter: ['style'] });
    });
});// ===== FINAL GAP FIX - ADD AT THE VERY END OF YOUR JS FILE =====
jQuery(document).ready(function ($) {
    console.log('🎯 Final gap fix applied');

    function finalFix() {
        // Only hide the headline strictly on the index/home page if needed, but not globally
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/A2Z/')) {
            $('section.btPageHeadline').css({
                'display': 'none',
                'visibility': 'hidden',
                'opacity': '0',
                'height': '0',
                'margin': '0',
                'padding': '0',
                'pointer-events': 'none'
            });
        }

        if ($(window).width() <= 991) {
            // Reset all content spacing on mobile (exempted bt_bb_wrapper to prevent footer collapse)
            $('.btContentWrap, .btContentHolder, .btContent').css({
                'margin-top': '0',
                'padding-top': '0',
                'transform': 'none'
            });
        }

        // Make sure the real content is visible
        $('section.bt_bb_section').not('.btPageHeadline').first().css({
            'display': 'block',
            'visibility': 'visible',
            'opacity': '1'
        });
        console.log('✅ Final fix checked');
    }

    // Run multiple times
    finalFix();
    setTimeout(finalFix, 100);
    setTimeout(finalFix, 300);
    setTimeout(finalFix, 500);
    setTimeout(finalFix, 1000);

    // Run on resize
    $(window).on('resize', function () {
        finalFix();
    });

    // Run on load
    $(window).on('load', function () {
        finalFix();
    });
});// ===== MOBILE GAP FIX - FORCES CONTENT TO TOP =====
jQuery(document).ready(function ($) {
    console.log('📱 Mobile gap fix running');

    function fixMobileGap() {
        if ($(window).width() <= 991) {
            // Log the current positions to debug
            var headerHeight = $('.mainHeader').outerHeight() || 0;
            var contentTop = $('.btContentWrap').offset().top || 0;
            console.log('Header height:', headerHeight, 'Content top:', contentTop);

            // FORCE everything to the top
            $('body').css('overflow-x', 'hidden');

            // Pull content up
            $('.btContentWrap').css({
                'margin-top': '-70px',
                'padding-top': '0',
                'position': 'relative',
                'z-index': '1'
            });

            // Fix any background image errors
            $('.bt_bb_column[style*="undefined"]').each(function () {
                var bgData = $(this).data('background_image_src');
                if (bgData) {
                    $(this).css('background-image', 'url(' + bgData + ')');
                } else {
                    $(this).css('background-image', 'none');
                }
            });

            console.log('✅ Mobile gap fixed with -70px margin');
        }
    }

    // Run multiple times
    fixMobileGap();
    setTimeout(fixMobileGap, 100);
    setTimeout(fixMobileGap, 300);
    setTimeout(fixMobileGap, 500);
    setTimeout(fixMobileGap, 1000);

    // Run on resize
    $(window).on('resize', function () {
        fixMobileGap();
    });

    // Run on load
    $(window).on('load', function () {
        fixMobileGap();
    });
});// ===== AGGRESSIVE MOBILE GAP FIX =====
jQuery(document).ready(function ($) {
    console.log('📱 Aggressive mobile gap fix');

    function aggressiveFix() {
        if ($(window).width() > 991) return; // Do not apply aggressive fix on Desktop

        if ($(window).width() <= 991) {
            // Get the header position
            var headerBottom = $('.mainHeader').length ?
                $('.mainHeader').offset().top + $('.mainHeader').outerHeight() : 0;

            // Get the first real section (not the headline)
            var firstRealSection = $('section.bt_bb_section').not('.btPageHeadline').first();

            if (firstRealSection.length) {
                var sectionTop = firstRealSection.offset().top;
                var gap = sectionTop - headerBottom;

                console.log('Gap detected:', gap);

                // If gap exists, pull everything up
                if (gap > 20) {
                    $('.btContentWrap').css('margin-top', '-' + (gap - 20) + 'px');
                }
            }

            // Always hide the headline section on mobile
            $('section.btPageHeadline').css({
                'min-height': '0',
                'padding': '10px 0',
                'margin-bottom': '0'
            });
        }
    }

    aggressiveFix();
    setTimeout(aggressiveFix, 200);
    setTimeout(aggressiveFix, 500);
    setTimeout(aggressiveFix, 1000);

    $(window).on('resize', function () {
        aggressiveFix();
    });
});// ===== UNIVERSAL HEADER GAP FIX - WORKS ON ALL PAGES =====
jQuery(document).ready(function ($) {
    console.log('🌍 Universal header gap fix loaded');

    function fixAllPagesGap() {
        if ($(window).width() > 991) return; // Prevent breaking Desktop header layout

        // Get header height
        var header = $('.mainHeader');
        if (!header.length) return;

        var headerHeight = header.outerHeight();
        var headerBottom = header.offset().top + headerHeight;

        // Find the first content section (either headline or first section)
        var firstSection = $('.btPageHeadline').length ?
            $('.btPageHeadline') :
            $('section.bt_bb_section:first-of-type');

        if (!firstSection.length) return;

        // Calculate the gap
        var sectionTop = firstSection.offset().top;
        var gap = sectionTop - headerBottom;

        console.log('📏 Header height:', headerHeight, 'Gap:', gap);

        // Reset any previously applied fixes
        firstSection.css('margin-top', '');
        $('.btContentWrap, .btContentHolder, .btContent, .bt_bb_wrapper').css({
            'margin-top': '',
            'padding-top': ''
        });

        // Apply fix based on screen size
        if ($(window).width() <= 991) {
            // Mobile - pull up by 60px
            firstSection.css('margin-top', '-60px');
            console.log('📱 Mobile fix applied: -60px');
        } else if ($(window).width() >= 991) {
            // Desktop - remove theme padding
            $('.btPageHeadline .bt_bb_port').css('padding-top', '0');
            console.log('💻 Desktop fix applied');
        } else {
            // Tablet - pull up by 80px
            firstSection.css('margin-top', '-80px');
            console.log('📟 Tablet fix applied: -80px');
        }

        // If there's still a gap, use exact measurement
        setTimeout(function () {
            var newSectionTop = firstSection.offset().top;
            var newHeaderBottom = header.offset().top + header.outerHeight();
            var newGap = newSectionTop - newHeaderBottom;

            if (newGap > 20) {
                var currentMargin = parseInt(firstSection.css('margin-top')) || 0;
                firstSection.css('margin-top', (currentMargin - newGap) + 'px');
                console.log('✅ Fine-tuned margin to:', firstSection.css('margin-top'));
            }
        }, 100);
    }

    // Run multiple times
    fixAllPagesGap();
    setTimeout(fixAllPagesGap, 100);
    setTimeout(fixAllPagesGap, 300);
    setTimeout(fixAllPagesGap, 500);
    setTimeout(fixAllPagesGap, 1000);

    // Run on resize and load
    $(window).on('resize load orientationchange', function () {
        setTimeout(fixAllPagesGap, 50);
    });

    // Run after images load
    $(window).on('load', function () {
        setTimeout(fixAllPagesGap, 200);
        setTimeout(fixAllPagesGap, 500);
    });
});// Force slick slider refresh on mobile
jQuery(window).on('resize orientationchange', function () {
    if (jQuery(window).width() <= 991) {
        jQuery('.slick-slider').slick('resize');
    }
});// ===== GLOBAL FIXES – RUN ON ALL PAGES =====
jQuery(document).ready(function ($) {
    console.log('🔧 Running complete fix script...');

    // ============================================
    // 1. RESET HEADER GAP (universal)
    // ============================================
    function resetOffsets() {
        if ($(window).width() > 991) return; // DON'T BREAK DESKTOP
        $('.btContentWrap, .btContentHolder, .btContent, .bt_bb_wrapper, .btPageWrap').css({
            'transform': 'none',
            'margin-top': '0',
            'padding-top': '0',
            'position': 'relative',
            'top': '0'
        });
        $('section.bt_bb_section').first().css({
            'margin-top': '0',
            'padding-top': '0'
        });
    }
    resetOffsets();
    $(window).on('resize', resetOffsets);

    // ============================================
    // 2. MOBILE SPECIFIC FIXES
    // ============================================
    function fixMobileLayout() {
        if ($(window).width() <= 991) {
            // Hide any floating elements
            $('.bt_bb_floating_element, .bt_bb_floating_image, .bt_bb_image[style*="position: absolute"]').hide();

            // Reset any negative margins on specific rows
            $('.bt_bb_row[style*="margin-top"]').css('margin-top', '2em');
            $('.bt_bb_row.bt_bb_row_width_boxed_991[style*="margin-top"]').css('margin-top', '0');

            // Force all columns to stack
            $('.bt_bb_column, .bt_bb_column_inner').css({
                'width': '100%',
                'max-width': '100%',
                'flex-basis': '100%',
                'padding-left': '20px',
                'padding-right': '20px'
            });

            // Fix slider height
            $('.bt_bb_content_slider, .slick-slider, .slick-list, .slick-track, .slick-slide').css('height', 'auto');

            // Refresh slick slider if present
            if ($('.slick-slider').hasClass('slick-initialized')) {
                $('.slick-slider').slick('setPosition');
            }
        } else {
            // Restore original styles for desktop (optional)
            $('.bt_bb_floating_element, .bt_bb_floating_image, .bt_bb_image[style*="position: absolute"]').show();
        }
    }

    // Run multiple times to catch late-loading content
    fixMobileLayout();
    setTimeout(fixMobileLayout, 300);
    setTimeout(fixMobileLayout, 600);
    $(window).on('resize orientationchange', function () {
        setTimeout(fixMobileLayout, 50);
    });

    // ============================================
    // 3. SLICK SLIDER RECALC ON MOBILE
    // ============================================
    $(window).on('load', function () {
        if ($(window).width() <= 991 && $('.slick-slider').length) {
            setTimeout(function () {
                $('.slick-slider').slick('setPosition');
            }, 200);
        }
    });

    // ============================================
    // 4. DIAGNOSTIC TOOL – REMOVE AFTER FIXING
    // ============================================
    function debugCollapse() {
        console.log('🔍 Checking for problematic elements...');
        $('*').each(function () {
            var $el = $(this);
            var transform = $el.css('transform');
            var marginTop = parseInt($el.css('margin-top'));
            var top = parseInt($el.css('top'));
            var height = $el.height();

            if (transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
                console.log('⚠️ Transform found:', this.tagName, this.className, transform);
            }
            if (marginTop < -50) {
                console.log('⚠️ Large negative margin-top:', this.tagName, this.className, marginTop);
            }
            if (top < -50) {
                console.log('⚠️ Large negative top:', this.tagName, this.className, top);
            }
            if (height === 0 && $el.children().length > 0) {
                console.log('⚠️ Zero-height container:', this.tagName, this.className);
            }
        });
    }
    // ============================================
    // 5. CONSULTANTS SECTION & COUNTER FIXES
    // ============================================
    function fixConsultantsSection() {
        var $section = $('.bt_bb_section.bt_bb_color_scheme_1').filter(function () {
            return $(this).css('background-color') === 'rgb(34, 34, 34)' ||
                $(this).css('background-color') === '#222222';
        });
        if ($section.length) {
            var $bgColumn = $section.find('.bt_bb_column.btLazyLoadBackground');
            if ($bgColumn.length) {
                var bgUrl = $bgColumn.data('background_image_src');
                if (bgUrl) {
                    $bgColumn.css({
                        'background-image': 'url(' + bgUrl + ')',
                        'background-size': 'cover',
                        'background-position': 'right center'
                    });
                }
            }
            var $counterRow = $section.find('.bt_bb_row.bt_bb_row_width_boxed_991');
            if ($counterRow.length) {
                $counterRow.css({
                    'margin-top': '-18em',
                    'margin-bottom': '5em',
                    'z-index': '2',
                    'position': 'relative',
                    'background-color': '#c3a660'
                });
            }
        }
    }

    function fixCounterColors() {
        $('.bt_bb_counter_holder').each(function () {
            var currentStyle = $(this).attr('style') || '';
            currentStyle = currentStyle.replace(/color:\s*#[0-9a-f]+;?/gi, '');
            $(this).attr('style', currentStyle + '; color: #c3a660 !important');
            $(this).find('*').css('color', '#c3a660');
            $(this).css('color', '#c3a660');
        });
    }

    // Run again
    setTimeout(fixConsultantsSection, 500);
    setTimeout(fixCounterColors, 500);
    $(window).on('load', function () {
        fixConsultantsSection();
        fixCounterColors();
    });

    // Uncomment the next line to run the diagnostic on page load (remove after testing)
    // debugCollapse();
});
