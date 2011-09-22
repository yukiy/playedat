function getVideoIdFromUrl(url){
	var videoId = url.split('v=')[1];
	var andPosition = videoId.indexOf('&');
	if(andPosition != -1) {
		videoId = videoId.substring(0, andPosition);
	}
	return videoId;
}

function getVideoData(url){
	var youtubeApi = "http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&q=";
	var id = getVideoIdFromUrl(url);	
	var q = youtubeApi+id;	
	$.getJSON(q, function(res){
		console.log(res);
		return res;
	});
}

function isEmbeddable(url, yesFunc, noFunc){
	var youtubeApi = "http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&q=";
	var id = getVideoIdFromUrl(url);	
	var q = youtubeApi+id;
	
	var success = function(res){
		if(res.data.totalItems > 0 || res.data.totalItems == undefined || res.data.totalItems == null){
			var status = res.data.items[0].accessControl.embed;
			if(status == "allowed"){
				yesFunc(url);
				return true;
			}else{
				noFunc(url);
				return false;
			}
		}else{
			noFunc();
		}
	}
	var error = function(res){
		alert(res);
	}
	
	$.ajax({
		url: q,
		dataType: 'json',
		success: success,
		error: error
	});
	
}


function setVideo(elId, name, w, h, videoId){
	setHTML(elId, name, w, h);
	google.setOnLoadCallback(setPlayer(videoId, name));
}


function setHTML(elId, name, w, h){
	$(elId).empty();
	$(elId).append("<div id='"+name+"' class='container'></div>");
	$("#"+name).append("<div id='"+name+"_player' class='video_player'><div id='"+name+"_playerContainer'>Loading...</div></div>");
	$("#"+name).append("<div id='"+name+"_info' class='video_info'></div>");
	
	var style = {
		width: w,
		height: h
	}
	$('.container').css(style);
}

function setPlayer(videoId, name){
	var params = { allowScriptAccess: "always" };
	var atts = { id: videoId, class: "player_object"};
	var swfUri = "http://www.youtube.com/v/"+videoId+"&enablejsapi=1&playerapiid="+ videoId;
//	var swfUri = "http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid="+ videoId; //without chrome
	swfobject.embedSWF(swfUri, name + "_playerContainer", "100%", "100%", "8", null, null, params, atts);
}

// This function is automatically called by the player once it loads
function onYouTubePlayerReady(videoId) {
	videoId = decodeURI(videoId);
	var player = document.getElementById(videoId)
	player.cueVideoById(videoId);
}

