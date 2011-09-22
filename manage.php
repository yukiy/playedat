<html>
<head>
</head>
<body>
	<form method="POST" action="manage.php">
		delete<input id="deleteId" name="deleteId" type="textbox" size="2"/>
		<input type="submit" value="delete"/>
	</form>
	<?php
		

		function deleteRowById($dbName){
		$dbName = "database.db";
			$id = $_POST['deleteId'];
			if($id){
				if($db = new sqlite3($dbName)){
					$query = "DELETE FROM myTable WHERE id='$id'";
					$result = $db->query($query);
				}else{
					die("error to open database");
				}
				$db->close();
			}
		}

		function printData(){
			if($db = new sqlite3("database.db")){
				$query = "SELECT * FROM myTable";
				$result = $db->query($query);
				while($info = $result->fetchArray(SQLITE3_ASSOC)){
					print "id = {$info['id']}, ";
					print "placename = {$info['placename']}, ";
					print "lat = {$info['lat']}, ";
					print "lng = {$info['lng']}, ";
					print "songname = {$info['songname']}, ";
					print "artist = {$info['artist']}, ";
					print "videoURL = {$info['videoURL']}, ";
					print "videoID = {$info['videoId']}, ";
					print "<br/>";
				}
			}else{
				die("error");
			}
			$db->close();
		}
		
		function myFunc(){
		$dbName = "database.db";
			if(file_exists($dbName)){
				if(isset($_POST['deleteId'])){
					deleteRowById();
				}
				printData();
			}
		}
		myFunc();
	?>
</body>
</html>
