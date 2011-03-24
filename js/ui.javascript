
/*********************************************************************************************
Copyright 2010 Department of Technology, City and County of San Francisco. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY DEPARTMENT OF TECHNOLOGY, CITY AND COUNTY OF SAN FRANCISCO ``AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL DEPARTMENT OF TECHNOLOGY, CITY AND COUNTY OF SAN FRANCISCO OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those of the
authors and should not be interpreted as representing official policies, either expressed
or implied, of Department of Technology, City and County of San Francisco.

******************************************************************************************/

/*
*  Set of functions to redefine Zoom In/Out control on Google map
*/
// We define the function first
function TextualZoomControl() {
}

// To "subclass" the GControl, we set the prototype object to
// an instance of the GControl object
TextualZoomControl.prototype = new GControl();

// Creates a one DIV for each of the buttons and places them in a container
// DIV which is returned as our control element. We add the control to
// to the map container and return the element for the map class to
// position properly.
TextualZoomControl.prototype.initialize = function(map) {
  var container = document.createElement("div");

  var zoomInDiv = document.createElement("div");
  this.setButtonStyle_(zoomInDiv);
  container.appendChild(zoomInDiv);
  zoomInDiv.appendChild(document.createTextNode("Zoom In"));
  GEvent.addDomListener(zoomInDiv, "click", function() {
    map.zoomIn();
  });

  var zoomOutDiv = document.createElement("div");
  this.setButtonStyle_(zoomOutDiv);
  container.appendChild(zoomOutDiv);
  zoomOutDiv.appendChild(document.createTextNode("Zoom Out"));
  GEvent.addDomListener(zoomOutDiv, "click", function() {
    map.zoomOut();
  });

  map.getContainer().appendChild(container);
  return container;
}

// By default, the control will appear in the top left corner of the
// map with 7 pixels of padding.
TextualZoomControl.prototype.getDefaultPosition = function() {
  return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(7, 7));
}

// Sets the proper CSS for the given button element.
TextualZoomControl.prototype.setButtonStyle_ = function(button) {
  button.style.textDecoration = "underline";
  button.style.color = "#0000cc";
  button.style.backgroundColor = "white";
  button.style.font = "small Arial";
  button.style.border = "1px solid black";
  button.style.padding = "2px";
  button.style.marginBottom = "3px";
  button.style.textAlign = "center";
  button.style.width = "6em";
  button.style.cursor = "pointer";
}

/*
*   Javascript handy functions
*/
// define getElementsByClassName
document.getElementsByClassName = function(cl) {
    var retnode = [];
    var myclass = new RegExp('\\b'+cl+'\\b');
    var elem = this.getElementsByTagName('*');
    for (var i = 0; i < elem.length; i++) {
        var classes = elem[i].className;
    if (myclass.test(classes)) retnode.push(elem[i]);
    }
    return retnode;
};


    // google maps
    google.load("maps", "2",{"other_params":"sensor=true"});
    var map;
    var map2;
    var geocoder;
    var geocoder2;
    var marker;
    // set of SF zipcodes, use verify user entered address.
    var sfzipcodes = new Array(94102,94103,94104,94105,94107,94108,94109,94110,94111,94112,94114,94115,94116,94117,94118,94121,94122,94123,94124,94127,94129,94130,94131,94132,94133,94134,94158);

    function sf_only(zip){
        for(var i=0;i<sfzipcodes.length;i++){
            if(sfzipcodes[i] == zip)
                return true;
        }
        return false;
    }
    function initialize() {
        if(typeof(output_array) != "undefined"){
            submitted();
        }
        else
            init_map();

	//set the height if for google map, width is currently maxed at 765px
        FB.Canvas.setSize({ width: 800, height: 1000 });
    }
    function initmap(){
        if(!map)
            init_map();
    }
    function init_map(){
        if (GBrowserIsCompatible()) {
                if (!map)
                    map = new GMap2(document.getElementById("map_area"), {size: new GSize(360, 300)});
                var point = new GLatLng(37.77638, -122.418873);
                map.setCenter(point, 13);
                if (typeof(marker) == 'undefined'){
                    marker = new GMarker(point, {draggable: true});
                }
                //map.setUIToDefault();
                //map.addControl(new TextualZoomControl());
                map.addOverlay(marker);

                if (!geocoder)
                    geocoder = new GClientGeocoder();

                // traps mouse event
                GEvent.addDomListener(document.getElementById("address"), 'blur', function(e) {
                    var location_info = document.getElementById("selected_address");
                    if (location_info == undefined || location_info.value != this.value) {
                        draw_map(this, '', '');
                    }
                });
                //traps enter key event
                GEvent.addDomListener(document.getElementById("address"), 'keyup', function(e) {
                    if (e.keyCode == 13) {
                        draw_map(this, '', '');
                    }
                })
            }
    }


    function update_map(lat, long, div){
        var location_info = document.getElementById('address');
        //if update from typing in location input field
        if (lat == '' || long == '') {
            //SF address only, if no city(indicate by comma separator) is present, default city to SF.
            if(location_info.value.indexOf(",") < 0 && location_info.value.toLowerCase().indexOf("sf") < 0 && location_info.value.toLowerCase().indexOf("san francisco") < 0 )
                location_info.value = location_info.value + ", SF ";
            geocoder.getLocations(
                    div.value,
                    function(response) {
                        if (response.Status.code == 200) {
                            point = new GLatLng(response.Placemark[0].Point.coordinates[1], response.Placemark[0].Point.coordinates[0]);
                            var zipcode = response.Placemark[0].AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode.PostalCodeNumber;
                            if(!sf_only(parseInt(zipcode))){
                                document.getElementById("location_error").style.display = "block";
                                return false;
                            }
                            else{
                                document.getElementById("location_error").style.display = "none";
                            }
                            map.setCenter(point, 16);
                            marker.setLatLng(point);
                            map.addOverlay(marker);
                            div.value = response.Placemark[0].address;
                            document.getElementById('selected_address').value = div.value;
			                document.getElementById("selected_lat").value = lat;
                            document.getElementById("selected_lon").value = long;
                        }
                    });
        }
        else{   // if update from dragging marker
            var point = new GLatLng(lat, long);
            map.setCenter(point, 16);
            marker.setLatLng(point);
            map.addOverlay(marker);
        //update address label
            geocoder.getLocations(
                point,
                function(response){
                        div.value = response.Placemark[0].address;
                        document.getElementById('selected_address').value = div.value;
                    }
                )
      }
      //div.select();
    }
    //draw the google map
    function draw_map(div, lat, long){
	//resize the height if for google map, width is currently maxed at 765px
	FB.Canvas.setSize({ width: 800, height: 1000 });
        if(!div || div.value == '')
            return false;
        var location_info = document.getElementById('address');
        if (lat == '' || long == '') {
            //SF address only, if no city(indicate by comma separator) is present, default city to SF.
            if (location_info.value.indexOf(",") < 0 && location_info.value.toLowerCase().indexOf("sf") < 0 && location_info.value.toLowerCase().indexOf("san francisco") < 0)
                location_info.value = location_info.value + ", SF ";

            geocoder.getLocations(
                    div.value,
                    function(response) {
                        if (response.Status.code == 200) {
                            point = new GLatLng(response.Placemark[0].Point.coordinates[1], response.Placemark[0].Point.coordinates[0]);
                            var zipcode = response.Placemark[0].AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode.PostalCodeNumber;
                            if (!sf_only(parseInt(zipcode))) {
                                document.getElementById("location_error").style.display = "block";
                                return false;
                            }
                            else {
                                document.getElementById("location_error").style.display = "none";
                            }
                            document.getElementById("errorLocationDiv").style.display = "none";
                            //show map upon successful geocoded
                            if(document.getElementById("map_area").style.display == "none"){
			        document.getElementById("right-panel").className = "right-panel2";
				document.getElementById("map_area").style.display = "block";
			    }
                            map.addControl(new TextualZoomControl());

                            marker.setLatLng(point);
                            var currentHtml = "Here's the address, you can move the marker to the exact position";
                            var infoTabs = [ new GInfoWindowTab("Current", currentHtml)];
                            marker.openInfoWindowTabsHtml(infoTabs, {maxWidth: 80, maxHeight:40});

                            map.addOverlay(marker);
                            map.setCenter(point, 16);

                            //add event listener to drag action
                            GEvent.addListener(marker, "dragend", function() {
                                map.removeOverlay(marker);
                                draw_map(location_info, marker.getPoint().lat().toString(), marker.getPoint().lng().toString())
                            });
                            //update lat - lon field
                            document.getElementById("selected_lat").value = response.Placemark[0].Point.coordinates[1];
                            document.getElementById("selected_lon").value = response.Placemark[0].Point.coordinates[0];
                        }
                        if (!response || response.Status.code != 200) {
                            //location_info.value = "invalid address, please try again";
                            var errorDiv = document.getElementById("errorLocationDiv");
                            errorDiv.style.display = "block";
                            errorDiv.innerHTML = "Cannot find location, please try again.";
                            document.getElementById("map_area").style.display = "none";
                        }
                    }
                    );
                  document.getElementById('selected_address').value = location_info.value;
        }
        else {   // if update from dragging marker
            var point = new GLatLng(lat, long);
            map.setCenter(point, 16);
            marker.setLatLng(point);
            map.addOverlay(marker);
            //update address label
            geocoder.getLocations(
                    point,
                    function(response) {
                            div.value = response.Placemark[0].address;
                            document.getElementById('selected_address').value = div.value;
                        }
                    )
        }
        return true;
    }
    google.setOnLoadCallback(initialize);

function show_request_panel() {
    if (document.getElementById("selected_service").value != "") {
        toggle_tabs("request_content", "info_content", "output_content");
        setSelected('');
        document.getElementById('request_li').className = "xtab_selected";
    }
    else {
        var info_content = document.getElementById("info_area");
        info_content.innerHTML = "<br>Step 1: Find the service 	<br><br>Step 2: Provide details	<br><br>Step 3: Submit!<br><br><br>";
    }
    if(document.getElementById("map_area").style.display != "none"){
        document.getElementById("right-panel").className = "right-panel2";
    }
	
}

// turn on/off the left panel tabs.
function toggle_tabs(div, the_other_div, another_div) {
    document.getElementById(the_other_div).style.display = "none";
    document.getElementById(another_div).style.display = "none";
    document.getElementById(div).style.display = "block";

    
    if(div == "info_content"){
	    document.getElementById("right-panel").className = "right-panel";
        document.getElementById("info_li").className = "xtab_selected";
        document.getElementById("request_li").className = "";
        document.getElementById("submitted_li").className = "";
    }
    else{
	    if(document.getElementById("map_area").style.display == "none" && document.getElementById("map_requested").style.display == "none")
        	document.getElementById("right-panel").className = "right-panel1";
	    else
        	document.getElementById("right-panel").className = "right-panel2";
	}
    if(document.getElementById("info_service_requested") != null){
        if(document.getElementById("mouseover_service") != null){
        //if(document.getElementById("mouseover_service").value.replace(/^\s+|\s+$/g, '') == document.getElementById("info_service_requested").value.replace(/^\s+|\s+$/g, '') )
            //alert("here");
        }
    }
}

//show description for service when mouse points over the service name.
function show_service_info(div, description, ismouseover) {
    var info_content = document.getElementById("info_area");
    //set the service description.
    //var info_html = "<br>Request: " + div.innerHTML + "<br><br>Service Description:<br>";
   if(document.getElementById("mouseover_service") != null)
        document.getElementById("mouseover_service").value = service_list_array[description][1];
    var info_html ="";	
    if (description != '' || description == 0)
        info_html = info_html + service_list_array[description][2];
    info_content.innerHTML = "<br><br>" + info_html + "<br><br>Click on the service to report the problem.<br><br><br>";

    if (document.getElementById("info_content").style.display == "none") {
        var location = document.getElementById("address").value;
    }
    if(ismouseover)
	    document.getElementById("right-panel").className = "right-panel";

}

//search an array for matching items.
function isValueInArray(arr, val) {
    inArray = false;
    for (i = 0; i < arr.length; i++)
	    if (val == arr[i])
		    inArray = true;
    return inArray;
}
//construct the service list based on search term.
function search_list(div) {
    var keyword = document.getElementById("search_value");
    var div = document.getElementById("service_list_div");
    var html_content = "";

    //hardcode: pothole/potholes/pot hole should be treated as "defect". TODO: use mapping for these kind of custom synonyms.
    if(keyword.value == "pothole" || keyword.value == "potholes" || keyword.value == "pot hole" || keyword.value == "pot holes")
	keyword.value = "defect";

    if (keyword.value == '' || keyword.value == "Search keyword") { //if no keyword entered, display the top 5 service type
        if(service_list_array.length > 1){		
		html_content = html_content + "<div style='font-size: 1.5em; text-align: center; border-bottom-style:solid; border-bottom-width:0.1em; border-color:#BDBDBD;'>Most popular</div>";
		for (o = 0; o < 8; o++) {
	            var description = service_list_array[o][2];
        	    html_content = html_content + "<div class='service_list'><div onclick='construct_html(this," + o + ");set_serviceName(\"" + service_list_array[o][1] + "\");set_serviceCode(\"" + service_list_array[o][0].toString() + "\");' onmouseover='show_service_info(this," + o + ",1);'  onmouseout='initmap();' >" + service_list_array[o][1] + "</div></div>";
        	}
	}
    }
    else {
        var sArray = keyword.value.split(" ");
        var use_soundex = false;
        var synonyms = "";
        var exact_match = false;
	var html_content1 = "";
	var matches = new Array();

        //search for exact matching
        for (var a = 0; a < sArray.length; a++) {
            for (o = 0; o < service_list_array.length; o++) {
                if (service_list_array[o][0].toLowerCase().indexOf(sArray[a].toLowerCase() + " ", 0) > -1 || service_list_array[o][2].toLowerCase().indexOf(sArray[a].toLowerCase() + " ", 0) > -1) {
		if(isValueInArray(matches, o) == false){
		html_content1 = html_content1 + "<div class='service_list'><div onclick='construct_html(this," + o + ");set_serviceName(\"" + service_list_array[o][1] + "\");set_serviceCode(\"" + service_list_array[o][0].toString() + "\");' onmouseover='show_service_info(this," + o + ",1);' onmouseout='initmap();' >" + service_list_array[o][1] + "</div></div>";
                    exact_match = true;
		    matches.push(o);
                }
		}
            }
        }
	if(exact_match)
		  html_content = html_content + "<div style='font-size: 1.5em; text-align: center; border-bottom-style:solid; border-bottom-width:0.1em; border-color:#BDBDBD;'>Select a service from below</div>" + html_content1;

        //synonym search
        if (exact_match == false) {
            for (var j = 0; j < sArray.length; j++) {
                synonyms = synonym_search(sArray[j]).split(",");
                //for each synonym
                for (var k = 0; k < synonyms.length; k++) {
                    if (synonyms[k].length > 1) {
                        for (o = 0; o < service_list_array.length; o++) {
                            if (service_list_array[o][0].toLowerCase().indexOf(synonyms[k].toLowerCase() + " ", 0) > -1 || service_list_array[o][2].toLowerCase().indexOf(synonyms[k].toLowerCase() + " ", 0) > -1){
				if(isValueInArray(matches, o) == false){
                                html_content1 = html_content1 + "<div class='service_list'><div onclick='construct_html(this," + o + ");set_serviceName(\"" + service_list_array[o][1] + "\");set_serviceCode(\"" + service_list_array[o][0].toString() + "\");' onmouseover='show_service_info(this," + o + ",1);' onmouseout='initmap();' >" + service_list_array[o][1] + "</div></div>";
        			exact_match = true;
				matches.push(o);
				}
				}
			}
                    }
                }
                //synonym search fails, try soundex, this feature is not being used for now.
                if (html_content.length < 10)
                    use_soundex = true;
            }
	  html_content = html_content + "<div style='font-size: 1.5em; text-align: center; border-bottom-style:solid; border-bottom-width:0.1em; border-color:#BDBDBD;'>Select a service from below</div>" + html_content1;
	  
        }
       
	//search yields no result
    }
    if (exact_match == false) {
            html_content = "<div style='margin: 10px 1px 40px 10px;'> We can't find what you're looking for, please call us! <br><br>";
            html_content = html_content + "Dial 3-1-1 (within SF only) or (415) 701-2311; <br>";
            html_content = html_content + "TTY direct (415) 701-2323;<br><br>";
            html_content = html_content + "24 hrs a day, 7 days a week, 365 days a year<br></div>";
            //disable submit button
	   if(document.getElementById("submit_request"))
	            document.getElementById("submit_request").disabled = true;

   }else {
   	if(document.getElementById("submit_request"))
         document.getElementById("submit_request").disabled = false;
   }      
   div.innerHTML = html_content;
}

function construct_html(div, description) {
    var request_content = document.getElementById("request_content");

    var location = document.getElementById("address");
    var service_name = document.getElementById("service_name");

    service_name.firstChild.nodeValue = div.innerHTML;
    show_service_info(div, description);
    toggle_tabs("request_content", "info_content", 'output_content');

    //set css class for each service list
    var service_divs = document.getElementsByClassName("service_list1");
    for (o = 0; o < service_divs.length; o++){
        service_divs[o].className = "service_list1";
        service_divs[o].parentNode.className = "service_list";
    }
    div.className = "service_list1";
    div.parentNode.className = "service_list service_list_selected";

    //set tab display
    document.getElementById("request_li").className = "xtab_selected";
    document.getElementById("info_li").className = "";

    document.getElementById("info_service_requested").value = service_name.firstChild.nodeValue;
    document.getElementById("info_service_desc").value = description;

    document.getElementById("request_li").style.display = "block";
    //set focus to address input
    location.focus();

    if (!map)
        init_map();
    
     //set input file image
}

//check if address has been entered
function validate_request(div) {
    var location = document.getElementById("address");
    var email = document.getElementById("email").value;
    
    if (location.value == "" || (email != "" && email.indexOf("@") < 0) ){
        html_content = "<br>Submission error: <br>Please enter an address location<br><br>";
        if(email.indexOf("@") < 0)
		    html_content = "<br>Submission error: <br>Please enter an valid email address<br><br>";
	    html_content = html_content + "<a href=\"#\" onclick=\"popup('popUpDiv');\"> ok</a> ";
        document.getElementById("errorMessage").innerHTML = html_content;
        popup("popUpDiv");
        return false;
    }else {
     //create loading spinner
    popup("popUpDiv");
    return true;
    }
}
// set the color of the selected service type
function setSelected(div) {
    var task_tab = document.getElementById("tasktabs").getElementsByTagName("li");
    for (o = 0; o < task_tab.length; o++)
        task_tab[o].className = "";
    if (div) {
        div.parentNode.className = "xtab_selected";
        var info_content = document.getElementById("info_area");
        //set the service description.
        if (document.getElementById("info_service_desc").value) {
            var info_html = "<br>Request: " + document.getElementById("info_service_requested").value + "<br><br>Service Description:<br>";
            info_html = info_html + service_list_array[document.getElementById("info_service_desc").value][2];
            info_content.innerHTML = info_html;
        }
        //set focus to address input
        if (document.getElementById("request_content").style.display != "none")
            document.getElementById("address").focus();

    }

}
function update_search_key(div) {
    var search_value = document.getElementById("search_value");
    search_value.value = div.value;
    //div.value='Search keyword'
}
function set_serviceCode(div) {
    document.getElementById('selected_service').value = div;
}
function set_serviceName(div){
    document.getElementById('selected_service_name').value = div;
}

function key_up(div, $char, $mozChar) {
    if ($char == 13 || $mozChar == 13) {
        var search_value = document.getElementById("search_value");
        search_value.value = div.value;
        search_list('');
    }
}

function submitted() {
    var output_content = document.getElementById("output_content");
    if (output_content) {
        toggle_tabs("output_content", "request_content", "info_content");
        output_content.style.display = "block";

        document.getElementById("submitted_li").style.display = "block";
        setSelected('');
        document.getElementById("submitted_li").className = "xtab_selected";

        document.getElementById("requester_email").value = output_array[8];
        document.getElementById("service_request_id").innerHTML = document.getElementById("service_request_id_h").value = "Service Request # " + output_array[0];
        document.getElementById("service_requested").innerHTML = document.getElementById("service_requested_h").value = "Request: <br> " + output_array[1];
        document.getElementById("location_requested").innerHTML = document.getElementById("location_requested_h").value = "Location: <br>" + output_array[2];
        document.getElementById("description_requested").innerHTML = document.getElementById("description_requested_h").value = "Brief Description: <br>" + unescape(output_array[3]);
        document.getElementById("media_url_requested").innerHTML = "Media URL: <br><a href='" + unescape(output_array[4]) + "'> " + unescape(output_array[4]) + "</a>";
	document.getElementById("media_url_requested_h").value = "Media URL: <br>" + unescape(output_array[4]);
        //document.getElementById("status_url").href = document.getElementById("status_url_h").value = output_array[9];

	if(output_array[8].indexOf("@") > 0)
	        document.getElementById("email_to_me").innerHTML = "<a href='#' onclick=\"sendemail();\">" + output_array[5] + '</a><div id="email_success"></div>';

	document.getElementById("return_to_facebook").innerHTML = "<br><a href='#' onclick=\"return_to_facebook('http://www.facebook.com/SF?ref=ts');\"> Return to CCSF Facebook page</a> ";
        document.getElementById("service_level_agreement").innerHTML = document.getElementById("service_level_agreement_h").value = unescape(output_array[6]);
        var geocoder1 = new GClientGeocoder();
        var map1 = new GMap2(document.getElementById("map_requested"),{size: new GSize(380, 300)});
        geocoder1.getLocations(output_array[7],
                function(response) {
                    if (response.Status.code == 200) {
                        point = new GLatLng(response.Placemark[0].Point.coordinates[1], response.Placemark[0].Point.coordinates[0]);
                        map1.setCenter(point, 16);
                        marker1 = new GMarker(point, {draggable: true});
                        marker1.setLatLng(point);
                        map1.addOverlay(marker1);
                    }
                });
    } //if
}


/*
*  AJAX calls
*/
function create_ajax()
    {
	var xmlHttp;
    try {
        xmlHttp = new XMLHttpRequest(); // Firefox, Opera 8.0+, Safari
    }
    catch (e) {
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP"); // Internet Explorer
        }
        catch (e) {
            try {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
                alert("Your browser does not support AJAX.");
                return false;
            }
        }
    }
    return xmlHttp;
}


function synonym_search(word) {
    var xmlHttp = create_ajax();

    // Timestamp for preventing IE caching the GET request, IE caches external url being requested.
    // attaching a variable to the url will generate a unique url everytime.
    fetch_unix_timestamp = function() {
        return parseInt(new Date().getTime().toString().substring(0, 10))
    }

    var url = "synonym.php";
    var timestamp = fetch_unix_timestamp();

    var nocacheurl = url + "?t=" + timestamp + "&key_word=" + word;

    //the calling function needs the returned value immediately, therefore
    //synchronous ajax call here is required
    xmlHttp.open("GET", nocacheurl, false);
    xmlHttp.send(null);
    //return response
    if (xmlHttp.status != 200)
        return "";
    return xmlHttp.responseText;
}

function sendemail(){
	//alert(document.getElementById("service_requested_h").value);
	var xmlHttp = create_ajax();
	fetch_unix_timestamp = function() {
        	return parseInt(new Date().getTime().toString().substring(0, 10))
    	}
	var url = "sendemail.php";
	var timestamp = fetch_unix_timestamp();
	
	var email = document.getElementById("requester_email").value;
	var service_id = document.getElementById("service_request_id_h").value;
	var service_location = document.getElementById("location_requested_h").value;
	var service_agreement = document.getElementById("service_level_agreement_h").value;
	var description = document.getElementById("description_requested_h").value;
	var media_url = document.getElementById("media_url_requested_h").value;
	var status_url = encodeURIComponent(output_array[9]);
	var service_requested = document.getElementById("service_requested_h").value;
	
	var nocacheurl = url + "?t=" + timestamp + "&address=" + escape(service_location) + "&description=" + description + "&email=" + encodeURIComponent(email) + "&media_url=" + media_url;
	nocacheurl = nocacheurl + "&status_url=" + status_url + "&service_agreement=" + service_agreement + "&service_requested=" + service_requested + "&service_id=" + service_id;

	// The code...
    	xmlHttp.onreadystatechange = function() {
        	if (xmlHttp.readyState == 4) {
	            document.getElementById("email_success").innerHTML = "<br>Email sent!<br>";
        	}
    	}
	xmlHttp.open("GET", nocacheurl, true);
	xmlHttp.send(null);

	return false;
}
function createRequest(div) {
    var xmlHttp = create_ajax();

    // Timestamp for preventing IE caching the GET request, IE caches external url being requested.
    // attaching a variable to the url will generate a unique url everytime.
    fetch_unix_timestamp = function() {
        return parseInt(new Date().getTime().toString().substring(0, 10))
    }

    var url = "createRequest.php";
    var timestamp = fetch_unix_timestamp();

    var location = document.getElementById('address').value;
    var service_type = document.getElementById('selected_location').value;
    var description = document.getElementById('description').value;
    var email = document.getElementById('email').value;
    var uploadfile = document.getElementById('fileupload');

    var nocacheurl = url + "?t=" + timestamp + "&address=" + escape(location) + "&service_type=" + service_type + "&description=" + description + "&email=" + encodeURIComponent(email) + "&fileupload=" + uploadfile;

    // The code...
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            document.getElementById("request_content").innerHTML = xmlHttp.responseText;
        }
    }
    xmlHttp.open("GET", nocacheurl, true);
    xmlHttp.send(null);
}


//pop up div for the submit spinner
function toggle(div_id) {
	var el = document.getElementById(div_id);
	if ( el.style.display == 'none' ) {	el.style.display = 'block';}
	else {el.style.display = 'none';}
}
function blanket_size(popUpDivVar) {
	if (typeof window.innerWidth != 'undefined') {
		viewportheight = window.innerHeight;
	} else {
		viewportheight = document.documentElement.clientHeight;
	}
	if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
		blanket_height = viewportheight;
	} else {
		if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
			blanket_height = document.body.parentNode.clientHeight;
		} else {
			blanket_height = document.body.parentNode.scrollHeight;
		}
	}
	var blanket = document.getElementById('blanket');
	blanket.style.height = blanket_height + 'px';
	var popUpDiv = document.getElementById(popUpDivVar);
	popUpDiv_height=blanket_height/2-150;//150 is half popup's height
	popUpDiv.style.top = popUpDiv_height + 'px';
}
function window_pos(popUpDivVar) {
	if (typeof window.innerWidth != 'undefined') {
		viewportwidth = window.innerHeight;
	} else {
		viewportwidth = document.documentElement.clientHeight;
	}
	if ((viewportwidth > document.body.parentNode.scrollWidth) && (viewportwidth > document.body.parentNode.clientWidth)) {
		window_width = viewportwidth;
	} else {
		if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
			window_width = document.body.parentNode.clientWidth;
		} else {
			window_width = document.body.parentNode.scrollWidth;
		}
	}
	var popUpDiv = document.getElementById(popUpDivVar);
	window_width=window_width/2-150;//150 is half popup's width
	popUpDiv.style.left = window_width + 'px';
}
function popup(windowname) {
	blanket_size(windowname);
	window_pos(windowname);
	toggle('blanket');
	toggle(windowname);
}


function showPop(div)	{
	var S = document.getElementById(div);
	S.style.display='block';
	}

function hidePop(div)
	{
	var S = document.getElementById(div);
	S.style.display='none';
	}

function movePop(div,Left,Top){
	var S = document.getElementById(div);
	S.style.left=parseInt(Left+document.body.parentNode.clientWidth)+"px";
	S.style.top=parseInt(Top+window.document.body.parentNode.clientHeight)+"px";
	}


function return_to_facebook(url) {
	top.location.href = url;
}
