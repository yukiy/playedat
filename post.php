<?php
	function createDB($dbName){
		if($db = new sqlite3($dbName)){
			$query = "CREATE TABLE myTable (id INTEGER PRIMARY KEY, placename VARCHAR(20), lat FLOAT, lng FLOAT, songname VARCHAR(20), artist VARCHAR(20), videoURL VARCHAR(100), videoID VARCHAR(20))";
			$result = $db->query($query);
			print "table was made";
		}else{
			die("error to open database");
		}
		$db->close();
	}
	
	function insertData(){
		$placename = $_POST['placename'];
		$latitude = $_POST['latitude'];
		$longitude = $_POST['longitude'];
		$songname = $_POST['songname'];
		$artist = $_POST['artist'];
		$videoURL = $_POST['videoURL'];
		$videoID = $_POST['videoID'];

		$latitude = floatval($latitude);
		$longitude = floatval($longitude);
		
		if($placename){
			if($db = new sqlite3("database.db")){
				$query = "INSERT INTO myTable (id, placename, lat, lng, songname, artist, videoURL, videoID) VALUES (NULL, '$placename', $latitude, $longitude, '$songname', '$artist', '$videoURL', '$videoID')";
				$result = $db->query($query);
				print "data are written<br/>";
			}else{
				die("error to open database");
			}
			$db->close();
		}
	}
	
	
	function myFunc(){
		$dbName = "database.db";
		if(file_exists($dbName)){
			if(isset($_POST['placename'])){
				insertData();
			}
		}else{
			createDB($dbName);
			if(isset($_POST['placename'])){
				insertData();
			}
		}
	}
	myFunc();
	echo "posted";
?>