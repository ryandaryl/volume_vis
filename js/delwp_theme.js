//Author: Trent Hobley - DELWP - Infomation Services Division
var xyz = null;
var SERVER_URL = "//services.land.vic.gov.au/search/rest/address/query";
var selectedAddress = "";
var selectedPFI = "";
var infoReturned = [];
var locate, triggered; // triggered is the global varable to make the location search field selectable on the map
var layerSwitcher;
$(function () {
    //Add Div for location, geolocator and print buttons
    var locDiv = $("<div></div>").addClass("olLocationDiv");
    $(".olControlLayerSwitcher").after(locDiv);
    $(".olMapViewport").append(locDiv);
    $(".olLocationDiv").append("<div class='olLocationSearch'></div>");
    $(".olLocationDiv").append("<a class='olGeoLocation'></a");
    var searchtext = $("<input type='text' id='autocomplete' class='olLocationSearchText' placeholder='Find Location'/>");
    searchtext.bind("keydown.autocomplete", function () {
        autocompleteBind(this);
    });
    $(".olLocationSearch").append(searchtext);
    $(".olLocationSearch").append("<div class='olLocationSearchImg'></div>")
    $(".olLocationDiv").after("<a class='olPrintBtn'></a>");
    $("input[type='radio'].olButton:checked").next().before('<div class="delwpRadioButton"></div>');

    $("a.olPrintBtn").on("click", function (e) {
        alert("Not Available Yet");
    });
    $("div.olLocationSearch").on("touchend click", function (e) {
        var search = $("div.olLocationSearch").children("input[type='text']");
        if (e.target.className === "ui-menu-item-wrapper")
        {
            if (e.type == "touchend") {
                e.stopPropagation();
                var ev = jQuery.Event("click");
                $(e.target).trigger(ev);
            }
            if (!triggered)
            {
                triggered = true; // if not set at this point. WILL CAUSE LOOP
                $(e.target).trigger(e); //Trigger the ENTER key event, due to another map function not bubbling the click event through
            }
        }
        else
            search.focus();
    });
    $('body').on('click', '.infoclose', function () {
        $("div.mapInfoDiv").remove();
        if ($("#map").width() > 600) {
            removeHighlightFeats();
        }
    });
    // add the event listenters if they are not in the map.events
    if (!theMap.eventListeners.changebaselayer) {
        theMap.events.on({
            changebaselayer: function () {
                addLayerSwitcherTriangle(0);
            }
        });
    } else {
        var user_cbl = theMap.eventListeners.changebaselayer;
        theMap.events.on({
            changebaselayer: function () {
                user_cbl();
                addLayerSwitcherTriangle(0);
            }
        });
    };
    if (!theMap.eventListeners.changelayer) {
        theMap.events.on({
            changelayer: function () {
                addLayerSwitcherTriangle(5);
            }
        });
    } else {
        var user_cl = theMap.eventListeners.changelayer;
        theMap.events.on({
            changelayer: function () {
                user_cl();
                addLayerSwitcherTriangle(5);
            }
        });
    }
    ;
    $("a.olGeoLocation").click(function () {
        var opts = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        window.navigator.geolocation.getCurrentPosition(geolocate, geoerror, opts);
    });
});
function geolocate(pos) {
    var point = new OpenLayers.LonLat([pos.coords.longitude, pos.coords.latitude]);
    point = point.transform(new OpenLayers.Projection("EPSG:4326"), theMap.getProjection());
    theMap.setCenter(point, 18, false);
}
;
function geoerror(err) {
    console.log(err);
    if (err.code !== 3) {
        alert("Geolocation error: " + err.message + "");
    }
}
;
// DELWP Info Overlay
function createDelwpInfoOverlay(infocontent) {
    if ($("div.removeinfo").length) {
        $("div.mapInfoDiv").remove();
    }
    if ($("div.mapInfoDiv").length) {
        var featdiv = $("<div class='featdiv'></div>");
        $("div.bottom").prepend(featdiv);
        var iconddiv = $("<div class='featicondiv'></div>");
        var featinfodiv = $("<div class='featinfodiv'></div>");
        featdiv.append(iconddiv).append(featinfodiv);
        var feattitlediv = $("<div class='feattypediv'></div>").html(infocontent.featType);
        var feattypediv = $("<h3 class='feattitlediv'></h3>").html(infocontent.featName);
        var feattabletab = $("<table class='feattabletab'></table>").html(createInfoTable(infocontent.table));
        featinfodiv.append(feattitlediv).append(feattypediv).append(feattabletab);
    } else {
        var infodiv = $("<div class='mapInfoDiv'></div>");
        var top = $("<div class='top'></div>");
        var closebtn = $("<div class='infoclose' ></div>");
        top.append(closebtn);
        //$("#map").after(infodiv);
        $("#map").after(infodiv);
        infodiv.append(top);
        var titlediv = $("<div class='titlediv'></div>").html(infocontent.title);
        var subtitlediv = $("<div class='subtitlediv'></div>").html(infocontent.subTitle);
        top.append(titlediv).append(subtitlediv);
        var bottom = $("<div class='bottom'></div>");
        infodiv.append(bottom);
        var featdiv = $("<div class='featdiv'></div>");
        bottom.append(featdiv);
        var iconddiv = $("<div class='featicondiv'></div>").css("background-image", "url('" + infocontent.featIcon + "')");
        var featinfodiv = $("<div class='featinfodiv'></div>");
        featdiv.append(iconddiv).append(featinfodiv);
        var feattitlediv = $("<div class='feattypediv'></div>").html(infocontent.featType);
        var feattypediv = $("<h3 class='feattitlediv'></h3>").html(infocontent.featName);
        var feattabletab = $("<table class='feattabletab'></table>").html(createInfoTable(infocontent.table));
        featinfodiv.append(feattitlediv).append(feattypediv).append(feattabletab);
        $("div.mapInfoDiv").delay(100).addClass("removeinfo");
    }
}
function createInfoTable(table) {
    var feattablerows;
    //var data = e.feature.attributes;
    $.each(table, function (k, v) {
        if (v) {
            feattablerows = feattablerows + "<tr><td class='left'>" + k + "</td><td class='right'>" + v + "</td></tr>";
        }
    });
    return feattablerows;
}
function addLayerSwitcherTriangle(wait) {
    setTimeout(// Wait for the div to complete drawing before adding the triangle for the active base layers
            function () {
                $("input[type='radio'].olButton:checked").next().before('<div class="delwpRadioButton"></div>');
            }, wait);
}
function autocompleteBind(el) {
    var autocomp = $(el).autocomplete({
        delay: 500,
        minLength: 3,
        appendTo: $(el).next(),
        source: function (request, response) {
            layerSwitcher.minimizeControl();
            xyz = $.getJSON(SERVER_URL + "?", {
                where: request.term,
                f: "auto"
            }, function (data) {
                // data is an array of objects and must be transformed for autocomplete to use
                var array = data.error ? [] : $.map(data.addresses, function (m) {
                    return {
                        label: m.address.toLowerCase(),
                        id: m.pfi
                    };
                });
                response(array);
            });
        },
        search: function (event, ui) {
            //fix bug in jQuery.ui somewhere where menu.bindings just grows and grows
            console.log(autocomp.data("ui-autocomplete").menu.bindings.length);
            autocomp.data("ui-autocomplete").menu.bindings = $();
        },
        focus: function (event, ui) {
            // prevent autocomplete from updating the textbox
            event.preventDefault();
        },
        select: function (event, ui) {
            autocompleteselectFunction(event, ui);
            $(this).blur();
        }
    });
}
;
function autocompleteselectFunction(event, ui) {
    // prevent autocomplete from updating the textbox
    event.preventDefault();
    // navigate to the selected item's url
    $(this).removeClass('ui-autocomplete-loading');
    if (xyz && ui) {

        xyz.abort();
        selectedAddress = ui.item.label;
        selectedPFI = ui.item.id;
        getMBR(ui.item.id);
        triggered = false;
        //console.log("triggered");
    }
}

function setFocus(field) {
    var f = document.getElementById(field);
    if (f)
        f.focus();
}

function setAddress(value) {
    var f = document.getElementById("currentaddress");
    if (f)
        f.value = value;
}
function removeHighlightFeats() {
    //console.log("removeHighlight Func");
    var l = theMap.getLayersByName("highlight");
    if (l.length) {
        l[0].removeAllFeatures();
    }
    ;

}

function getMBR(selection) {
    var mbr = "none";
    $.getJSON(SERVER_URL + "?",
            {
                selected: selection,
                f: "vicmapapi"
            },
    function (data) {
        var n = data.addresses;
        infoReturned = data.error ? [] : $.map(data.addresses, function (m) {
            return {
                label: m.address,
                mbr: m.mbr,
                point: m.point
            };
        });
        var f = $(".olLocationSearchText")
        if (f)
            f.val(selectedAddress)
        if (infoReturned && infoReturned.length == 1)
        {
            f.val(selectedAddress);
            theMap.zoomToExtent(new OpenLayers.Bounds(infoReturned[0].mbr.split(",")).transform(new OpenLayers.Projection("EPSG:4326"), theMap.getProjection()));
        }

    });
}
;