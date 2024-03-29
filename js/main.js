var videoError = false;

$(function(){
	setUserActionEvents();
	setDefVals();
	loadMarkersFromJson('./json.php');
})


function setUserActionEvents(){
	$("#address").keydown(function(e){if(e.keyCode == 13){jump();}});
	
	$("#contribute_btn").click(showForm);
	$("#preview").click(checkAction);
	$("#cancelForm").click(cancelForm);
	$("#post_btn").click(submitAction);
	
	$("#placename").click(function(){this.focus();this.select();});
	$("#songname").click(function(){this.focus();this.select();});
	$("#artist").click(function(){this.focus();this.select();});
	$("#videoURL").click(function(){this.focus();this.select();});

	$("#videoURL").keydown(function(){
		$("#videos").empty();
		$("#confirmation").hide();
	});
	
	$("#overlay").click(function(){
		$("#videos").empty();
		$("#confirmation").hide();
		
		$("#mainVideo").empty();

		$("#overlay").hide();
	});

}

function setDefVals(){
	setDefVal($("#placename"), "eg.) Abbey Road");
	setDefVal($("#songname"), "eg.) Come Together");
	setDefVal($("#artist"), "eg.) The Beatles");
	setDefVal($("#videoURL"), "eg.) http://www.youtube.com/watch?v=axb2sHpGwHQ");
}


function setDefVal(el, defVal){
	el.css({color:"#555"});
	el.val(defVal);

	el.focus(function() {
		if (el.val() == defVal) {
			el.css({color:"#000"});
			el.val("");
		  }
	});
	
	el.blur(function() {
		if (el.val() == "") {
			el.css({color:"#555"});
			el.val(defVal);
		}
	});
}

function showForm(){
	if($("#formDiv").css('display') == 'none'){
		myMarker.body.setVisible(true);
		$("#formDiv").css({display:'block'});
		var pos = myMarker.body.getPosition();
		moveMapCenter(pos.lat(), pos.lng());
		var centerX = $(window).width()/2;
		var centerY = $(window).height()/2;
		var formCenterX = $("#form").width()/2;
		var formCenterY = $("#form").height()/2;
		mainMap.panBy(-formCenterX,-formCenterY);
	}else{
		cancelForm();
	}
}

function cancelForm(){
	myMarker.body.setVisible(false);
	$("#videos").empty();
	$("#ok").empty();
	$("#confirmation").hide();
	$("#formDiv").css({display:'none'});
	$("#overlay").hide();
	setDefVals();
}


function preview(){
	$("#mainVideo").empty();

	var lat = strToFloat($("#latitude").val());
	var lng = strToFloat($("#longitude").val());
	var formObj = {
		placename: $("#placename").val(),
		latitude: lat,
		longitude: lng,
		songname: $("#songname").val(),
		artist: $("#artist").val(),
		videoURL: $("#videoURL").val()
	}
	
	try{
		formObj.videoID = getVideoIdFromUrl($("#videoURL").val());
	}catch(e){
		noEmbed();
	}
	
	//show confirmation div
	var top = $("#form").height() + 80 ;
	var left = $("#form").position().left;
	var width = $("#form").width();
	var leftAdjust = width*0.2/2;
	left = left + leftAdjust;
	
	var conCss = {
		top: top +"px",
		left: left + "px",
		width: width*0.8
	}
	$("#confirmation").show();
	$("#confirmation").css(conCss);
	
	//adjust the position of marker (center of the map)
	var centerX = $(window).width()/2;
	var centerY = $(window).height()/2;
	var h = $('#confirmation').height();
	var ytCenterX = $('#youtube').width()/2;
	moveMapCenter(lat, lng);
	mainMap.panBy(-ytCenterX,-Math.abs(top-centerY)-h);
	var markerX = ytCenterX + $(window).width()/2;
	var markerY = Math.abs(top-centerY)-h + $(window).height()/2;
	
	spotlight(markerX, markerY, 250);
}



function submitActionSimple(){
	var formObj = $("#form").serialize();
	$.post('./post.php',formObj,function(data){
		console.log(data);
	});
}

function submitAction(){
	var formObj = {
		placename: $("#placename").val(),
		latitude: strToFloat($("#latitude").val()),
		longitude: strToFloat($("#longitude").val()),
		songname: $("#songname").val(),
		artist: $("#artist").val(),
		videoURL: $("#videoURL").val(),
		videoID: getVideoIdFromUrl($("#videoURL").val())
	}
	$.post('./post.php',formObj,function(data){
		alert("Thank you. Data is added");
		loadMarkersFromJson('./json.php');
		cancelForm();
	})
}

function checkAction(){
	var searchUrl = $("#videoURL").val();
	try{
		$("#videos").empty();
		$("#ok").empty();
		isEmbeddable(searchUrl, yesEmbed, noEmbed);
	}catch(e){
		noEmbed();
	}
}

function yesEmbed(url){
	videoError = false;
	var videoId = getVideoIdFromUrl(url);
	var h = $("#form").height();
	var w = h*4/3;
	setVideo("#videos", "youtube", w, h, videoId);
	preview();
}

function noEmbed(){
	videoError = true;
	$("#ok").html("<div style='font-size:12px; color:#FF0000;'>Wrong URL or the video is not allowed to be embedded by the user. Try another video.</div>");
}

function strToFloat(str){
	var res = str.match( /[0-9]|\.|\-+/g );
	res= res.toString();
	res= res.replace(/,/g,"");
	res= parseFloat(res);
	return res;
}

///gmaps////////////////////////////////////////////////////
var mainMap;
var myMarker ={
	body: null,
	info: null
};

var iconImg = 
	new google.maps.MarkerImage("./img/micmarker.png",
	new google.maps.Size(20, 34),
	new google.maps.Point(0, 0),
	new google.maps.Point(11.0, 17.0)
);
var iconShadow =
	new google.maps.MarkerImage("./img/shadow-micmarker.png",
	new google.maps.Size(38, 34),
	new google.maps.Point(0, 0),
	new google.maps.Point(11.0, 17.0)
);

function initialize() {
	mainMap = createMap(london_latlng, 14, "ROAD");
	var mapOptions={
		styles:gmapstyle,
		panControl: false,
		zoomControlOptions:{
			position:google.maps.ControlPosition.RIGHT_CENTER
		}
	}
	mainMap.setOptions(mapOptions);
	jump();
}


////////// search location//////////////////////////////////////////
function jump(){
	var address = document.getElementById("address").value;
	codeAddress(address);
}

function codeAddress(address) {
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var location = results[0].geometry.location;
			mainMap.setCenter(location);
			mainMap.setZoom(14);
			createLocationInfoMarker(location);
		} else {
			alert("The Address is not found on the map.\n Please try another location.");
		  }
	});
}




////////// add new spot //////////////////////////////////////////

function createLocationInfoMarker(location){
		if(myMarker.body == undefined || myMarker.body == null){
			myMarker.body = new google.maps.Marker({
				position: location,
				map: mainMap,
				draggable: true,
				visible: false,
				icon: iconImg,
				shadow: iconShadow
			});
//			marker.info= createInfoWindow(mainMap, marker.body);
		}else{
			myMarker.body.setPosition(location);
		}
		updateLatlng(myMarker, location);
		setMarkerEvent(myMarker);
}

function updateLatlng(marker, loc){
	var lat = loc.lat().toFixed(6);
	var lng = loc.lng().toFixed(6);
	var latEl = document.getElementById("latitude").value = "Lat: "+lat;
	var latHEl = document.getElementById("latitudeH").value = "Lat: "+ lat;
	var lngEl = document.getElementById("longitude").value = "Lng: "+ lng;
	var lngHEl = document.getElementById("longitudeH").value = "Lng: "+ lng;
	var newInfoStr= "location : { lat: "+lat+", lng: "+lng+"}"
//	marker.info.setContent(newInfoStr);
}

function setMarkerEvent(marker){
	google.maps.event.addListener(marker.body, 'dragend', function() {
		var newLoc = marker.body.getPosition();
		updateLatlng(marker, newLoc);
	});
	google.maps.event.addListener(marker.body, 'drag', function() {
		var newLoc = marker.body.getPosition();
		updateLatlng(marker, newLoc);
//		marker.info.close();
	});
}


////////////////////////////////////////////////////////////////////////////
var markers = [];
function loadMarkersFromJson(json){
	$.getJSON(json,function(res){
		for(var i=0; i<res.data.length; i++){
			var location = new google.maps.LatLng(res.data[i].location.lat,res.data[i].location.lng);
			markers[i] = new google.maps.Marker({
				position: location,
				map: mainMap,
				title: res.data[i].songname,
				placeData: res.data[i],
				icon: iconImg,
				shadow: iconShadow
			});
			google.maps.event.addListener(markers[i],'click',function(pos){showVideo(this, pos.latLng)});
		}
	});
}

//TO DO: use a single player object, not to create new each time
function setVideoDiv(id){
	$("#mainVideo").empty();
	var h = '50%';
	var w = '50%';
	setVideo("#mainVideo", "videoOfPlace", w, h, id);
	$("#mainVideo").append("<div id='infobox'></div>");

/*
	$("#overlay").click(function(){
		$("#mainVideo").empty();
		$("#overlay").hide();
	});
*/
}


function showVideo(marker, pos){
	setVideoDiv(marker.placeData.videoID);
	setInfobox(marker.placeData);
	moveMapCenter(pos.lat(), pos.lng());
	var markerXGap = ($(window).width()/3);
	var markerYGap = ($(window).height()/3);
	mainMap.panBy( -markerXGap, -markerYGap);
	
	var markerX = markerXGap + $(window).width()/2;
	var markerY = markerYGap + $(window).height()/2;
	spotlight(markerX, markerY, 250);
}

function spotlight(x, y, size){
	$("#overlay").show();
	$("#overlay").css("background","-webkit-gradient(radial, " + x + " " + y +", 0," + x + " " + y +", " + size + ", from(rgba(255,255,0,0)), to(rgba(0,0,0,0.6)))");
}

function setInfobox(data){
	$("#infobox").empty();
	console.log(data);
	$("#infobox").html(data.songname+" is played at "+data.placename+" by "+data.artist+".</br>");
}
