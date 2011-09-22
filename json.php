<?php
	function makeJson($dbName){
		if($db = new sqlite3($dbName)){
			$query = "SELECT * FROM myTable";
			$result = $db->query($query);
			while($info = $result->fetchArray(SQLITE3_ASSOC)){
				$arr[] = array(
					id => $info['id'],
					placename => $info['placename'],
					location => array(
						lat => $info['lat'],
						lng => $info['lng']
					),
					songname => $info['songname'],
					artist => $info['artist'],
					videoURL => $info['videoURL'],
					videoID => $info['videoID']
				);
				$obj = array(data => $arr);
			}
				header("Content-Type: application/json; charset=UTF-8");
				$json_value	= json_encode($obj);
				echo jsonFormat($json_value);				
		}else{
			die("error");
		}
		$db->close();
	}
	

	function jsonFormat($json) {
		$result      = '';
		$pos         = 0;
		$strLen      = strlen($json);
		$indentStr   = '  ';
		$newLine     = "\n";
		$prevChar    = '';
		$outOfQuotes = true;
	
		for ($i=0; $i<=$strLen; $i++) {
			// Grab the next character in the string.
			$char = substr($json, $i, 1);	
			// Are we inside a quoted string?
			if ($char == '"' && $prevChar != '\\') {
				$outOfQuotes = !$outOfQuotes;
			// If this character is the end of an element, output a new line and indent the next line.
			} else if(($char == '}' || $char == ']') && $outOfQuotes) {
				$result .= $newLine;
				$pos --;
				for ($j=0; $j<$pos; $j++) {
					$result .= $indentStr;
				}
			}
			
			// Add the character to the result string.
			$result .= $char;
	
			// If the last character was the beginning of an element, output a new line and indent the next line.
			if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
				$result .= $newLine;
				if ($char == '{' || $char == '[') {
					$pos ++;
				}
				for ($j = 0; $j < $pos; $j++) {
					$result .= $indentStr;
				}
			}
			$prevChar = $char;
		}
		return $result;
	}
	
	
	function myFunc(){
		$dbName = "database.db";
		if(file_exists($dbName)){
			makeJson($dbName);
		}else{
			echo "There is currently no database.";
		}
	}
	
	myFunc();
?>