jQuery.ajaxSetup({ cache: false });

/**
  * Initialize all drop down boxes for given container.
  */
function initDropDownBoxes(container) {
    // ##### INIT VALUES #####
    jQuery('a.kill', container).hide(); // stays
    jQuery('.dropdown ul.more', container).hide();

    // ##### DROPDOWN MENU LOGIC #####
    jQuery('.opc-horizontal-nav > .dropdown > a', container).click(function() {
        if (jQuery(this).parent().hasClass('open')) {
            jQuery(this).parent().toggleClass('open');
            jQuery('a.kill').hide();
            jQuery('.dropdown ul.more').hide().removeClass('open');
        } else {
            var myPos = jQuery(this);
            jQuery('.opc-horizontal-nav li.open').removeClass('open');
            jQuery(myPos).parent().toggleClass('open');
            jQuery('a.kill').hide();
            jQuery('.dropdown ul.more').hide().removeClass('open');
        }
    });

    // CLICK .kill > .killable collapse
    jQuery('a.kill', container).click(function() {
        jQuery('a.kill').hide();
        jQuery('.killable').parent().removeClass('open');
    });
}

var time_out;
jQuery(document).ready(function(){
    /*jQuery('div.dropdown, #language-menu').bgiframe();*/
    // anti double click
    //jQuery("input[type='submit'].dblclick_hack").dblclick_hack();

    // drop down boxes
    initDropDownBoxes(null);
});

function hideAddProductMessage(id) {
    var e = document.getElementById(id);
    jQuery(e).html('');
}

function showErrors(id, error) {
    var errorHolder = document.getElementById(id);
    if (errorHolder) {
        jQuery(errorHolder).html(error);
        jQuery(errorHolder).show();
    }
}

function isArray(pArray) {
    return (typeof pArray == "object") && (pArray instanceof Array);
}

function uniqueArray(pArray) {
    if (pArray && isArray(pArray)) {
        var result = new Array();
        for (var ind = 0; ind < pArray.length; ind++) {
            if (jQuery.inArray(pArray[ind], result) == -1) {
                result.push(pArray[ind]);
            }
        }
        return result;
    }
    return pArray;
}

function concatMessages(messageArray) {
    var messages = "";
    if (messageArray && isArray(messageArray)) {
        for (var i = 0; i < messageArray.length; i++) {
            messages = messages + messageArray[i] + "<br/>";
        }
    }
    return messages;
}

var entitlementConfirmMessageMap = new Object();

function prepareMessagesForConfirm(keys) {
    var messageArray = new Array();
    if (keys && isArray(keys)) {
        for (var i = 0; i < keys.length; i++) {
            messageArray = messageArray.concat(entitlementConfirmMessageMap['messages_' + keys[i]]);
        }
    }
    return concatMessages(uniqueArray(messageArray));
}

function openConfirmDialog(params) {

    if (jQuery('#popupConfirmDialog').length == 0){
        //create special div for this dialog if it needs.
        jQuery('<div id="popupConfirmDialog" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true"></div>').appendTo('body');
    }

    jQuery('#popupConfirmDialog').html('<div class="modal-dialog">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '<h4 class="modal-title">' + params.title +'</h4>' +
      '</div>' +
      '<div class="modal-body">' +
        params.message +
      '</div>' +
      '<div class="modal-footer">' +
        '<button type="button" class="btn btn-default" data-dismiss="modal">' +
            (openConfirmDialog.defaultCancelButtonText ? openConfirmDialog.defaultCancelButtonText : "Cancel") +
        '</button>' +
        '<button type="button" class="btn btn-primary" data-dismiss="modal">' +
            (openConfirmDialog.defaultConfirmButtonText ? openConfirmDialog.defaultConfirmButtonText : "Ok") +
        '</button>'+
      '</div>' +
      '</div>' +
      '</div>').modal();

    // add onclick event listener after open dialog
    jQuery('#popupConfirmDialog .btn-primary').click(function(){
        params.buttons.confirm.handler();
    });
}

/*
 * fill all free space in form-inline (search field)
 * ** reloacted from jcatalog-bootstrap.js.
 * */
function autoWidth() {
    $('.form-inline .form-group.auto-width').each(function () {
        var myFormGroup = $(this);
        var siblingsWidth = 0;
        myFormGroup.siblings(':visible').each(function () {
            siblingsWidth = siblingsWidth + $(this).width();
        });

        /*console.log(siblingsWidth);*/
        myFormGroup.width(myFormGroup.parent().width() - siblingsWidth - 20);
    });
}

function gridCellEqualizer() {

    // calculate equalized height for grid cells
    // -------------------------------------------
    // this effectively takes a table that was converted to block type and turns it into a reordered table via js.
    // surprisingly, it's the most efficient way of converting data from table view to grid view without handling two separate html models.
    // however, it still is a pain in the ass. -mh

    //value reset for window resize
    $('.search-results').find('tr td').css('height','auto');

    $('.search-results.grid-view').each(function () {
        var cell = new Array($(this).find('tr:eq(0) > td').size());
        var i = 0;
        for (i = 0; i < cell.length; i++) {
            cell[i] = 0;
        }

        //get largest height values
        $(this).find('tr').each(function () {
            var i = 0;
            $(this).find('td').each(function () {
                if ($(this).height() > cell[i]) { cell[i] = $(this).height(); }
                i = i + 1;
            });
        });

        //set all to largest height values
        $(this).find('tr').each(function () {
            var i = 0;
            $(this).find('td').each(function () {
                $(this).height(cell[i]);
                i = i + 1;
            });
        });
    });
}

function classGrpEqualizer() {

    // calculate equalized heights for class groups

    $('.row.class-groups').each(function () {

        //value reset for window resize
        $(this).find('.group').css('height','auto');
        $(this).find('.item').css('height','auto');

        //get largest height values
        var imgHeight = 0;
        var itemHeight = 0;
        var itemNoImgHeight = 0;
        var groupHeight = 0;

        //get largest .img-wrapper height
        $(this).find('.item .img-wrapper').each(function() {
            if ($(this).height() > imgHeight) { imgHeight = $(this).height(); }
        });
        //set all .img-wrapper to largest height
        $(this).find('.item .img-wrapper').each(function() {
            $(this).height(imgHeight);
        });

        //get largest .item height
        $(this).find('.item').each(function() {
            if ($(this).hasClass('no-img')) {
                if ($(this).height() > itemNoImgHeight) { itemNoImgHeight = $(this).height() };
            } else {
                if ($(this).height() > itemHeight) { itemHeight = $(this).height(); };
            }
        });

        //set all .item to largest height
        $(this).find('.item').each(function () {
            if ($(this).hasClass('no-img')) {
                $(this).height(itemNoImgHeight);
            } else {
                $(this).height(itemHeight);
            }
        });

        //get largest .group height
        $(this).find('.group').each(function() {
            if ($(this).height() > groupHeight) { groupHeight = $(this).height(); }
        });
        //set largest .group height
        $(this).find('.group').each(function() {
            $(this).height(groupHeight);
        });

    });
}

$(window).resize(function () {
    // todo: extract within OPC-11297
    // adjudst searchbar width
    autoWidth();

    // calculate equalized height for grid cells
    // todo: extract within OPC-11297
    gridCellEqualizer();

    // calculate equalized height for classgroups
    // todo: extract within OPC-11297
    classGrpEqualizer();
});

$(document).ready(function () {
    // calculate equalized height for grid cells
    // todo: extract within OPC-11297
    gridCellEqualizer();

    // calculate equalized height for classgroups
    // todo: extract within OPC-11297
    classGrpEqualizer();

    // adjudst searchbar width
    // todo: extract within OPC-11297
    autoWidth();

    // handle filter toggle on XS screens (search results page filters & attributes sidebar)
    $('#filter-toggle').click(function() {
        $(this).toggleClass('active');
        $('#filters').toggleClass('active');
    });

    // todo: extract within OPC-11297
    $('.toggle, [data-toggle]').bind('click', function () {
        // adjudst searchbar width
        autoWidth();

        // adjust table.search-results.grid-view tr height to largest initial height in set
        // gridCellScaling();
    });
});

$(window).on('load', function () {
    // todo: extract within OPC-11297: automotive
    gridCellEqualizer();
    classGrpEqualizer();
});
