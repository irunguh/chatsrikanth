<?php
function chatHeartbeat($strUserName) {

	//$sql = "select * from chat where (chat.to = '".mysql_real_escape_string($_SESSION['username'])."' AND recd = 0) order by id ASC";
	
    $chat = Doctrine_Core::getTable('User')->getchatdatabyuser($strUserName,0);
    //$query = mysql_query($sql);
	$items = '';
  // echo $strUserName;
  // print_r($chat);
	$chatBoxes = array();
    $leng_ch = count($chat);

	for($ci=0; $ci<$leng_ch; $ci++ ) {
        
		if (!isset($_SESSION['openChatBoxes'][$chat[$ci]['from_user']]) && isset($_SESSION['chatHistory'][$chat[$ci]['from_user']])) {
			$items = $_SESSION['chatHistory'][$chat[$ci]['from_user']];
		}

		$chat['message'] = sanitize($chat[$ci]['message']);

		$items .= <<<EOD
					   {
			"s": "0",
			"f": "{$chat[$ci]['from_user']}",
			"m": "{$chat[$ci]['message']}"
	   },
EOD;

	if (!isset($_SESSION['chatHistory'][$chat[$ci]['from_user']])) {
		$_SESSION['chatHistory'][$chat[$ci]['from_user']] = '';
	}

	$_SESSION['chatHistory'][$chat[$ci]['from_user']] .= <<<EOD
						   {
			"s": "0",
			"f": "{$chat[$ci]['from_user']}",
			"m": "{$chat[$ci]['message']}"
	   },
EOD;

		unset($_SESSION['tsChatBoxes'][$chat[$ci]['from_user']]);
		$_SESSION['openChatBoxes'][$chat[$ci]['from_user']] = $chat[$ci]['sent'];
	}

	if (!empty($_SESSION['openChatBoxes'])) {
	foreach ($_SESSION['openChatBoxes'] as $chatbox => $time) {
		if (!isset($_SESSION['tsChatBoxes'][$chatbox])) {
			$now = time()-strtotime($time);
			$time = date('g:iA M dS', strtotime($time));

			$message = "Sent at $time";
			if ($now > 180) {
				$items .= <<<EOD
{
"s": "2",
"f": "$chatbox",
"m": "{$message}"
},
EOD;

	if (!isset($_SESSION['chatHistory'][$chatbox])) {
		$_SESSION['chatHistory'][$chatbox] = '';
	}

	$_SESSION['chatHistory'][$chatbox] .= <<<EOD
		{
"s": "2",
"f": "$chatbox",
"m": "{$message}"
},
EOD;
			$_SESSION['tsChatBoxes'][$chatbox] = 1;
		}
		}
	}
}


    Doctrine_Core::getTable('User')->updatechatbox($strUserName,0,1);
    //$sql = "update chat set recd = 1 where chat.to = '".mysql_real_escape_string($_SESSION['username'])."' and recd = 0";
	//$query = mysql_query($sql);

	if ($items != '') {
		$items = substr($items, 0, -1);
	}
header('Content-type: application/json');
?>
{
		"items": [
			<?php echo $items;?>
        ]
}

<?php
			exit(0);
}

function chatBoxSession($chatbox) {

	$items = '';

	if (isset($_SESSION['chatHistory'][$chatbox])) {
		$items = $_SESSION['chatHistory'][$chatbox];
	}

	return $items;
}

function startChatSession($strUserName) {
	$items = '';
	if (!empty($_SESSION['openChatBoxes'])) {
		foreach ($_SESSION['openChatBoxes'] as $chatbox => $void) {
			$items .= chatBoxSession($chatbox);
		}
	}


	if ($items != '') {
		$items = substr($items, 0, -1);
	}

header('Content-type: application/json');
?>
{
		"username": "<?php echo $strUserName;?>",
		"items": [
			<?php echo $items;?>
        ]
}

<?php


	exit(0);
}

function sendChat($from,$to,$message) {
	$from = $from;
	$to = $to;
	$message = $message;

	$_SESSION['openChatBoxes'][$to] = date('Y-m-d H:i:s', time());

	$messagesan = sanitize($message);

	if (!isset($_SESSION['chatHistory'][$to])) {
		$_SESSION['chatHistory'][$to] = '';
	}

	$_SESSION['chatHistory'][$to] .= <<<EOD
					   {
			"s": "1",
			"f": "{$to}",
			"m": "{$messagesan}"
	   },
EOD;


	unset($_SESSION['tsChatBoxes'][$to]);
    Doctrine_Core::getTable('User')->savechat($from,$to,$message,date('Y-m-d H:i:s'));
	//$sql = "insert into chat (chat.from,chat.to,message,sent) values ('".mysql_real_escape_string($from)."', '".mysql_real_escape_string($to)."','".mysql_real_escape_string($message)."',NOW())";
	//$query = mysql_query($sql);
	echo "1";
	exit(0);
}

function closeChat($username) {

	unset($_SESSION['openChatBoxes'][$username]);

	echo "1";
	exit(0);
}

function sanitize($text) {
	$text = htmlspecialchars($text, ENT_QUOTES);
	$text = str_replace("\n\r","\n",$text);
	$text = str_replace("\r\n","\n",$text);
	$text = str_replace("\n","<br>",$text);

    //$smileyUrl = "intranet/web/images/smileys/";
    //$text = parse_smileys($text, $smileyUrl);
	return $text;
}

function js_insert_smiley($form_name = '', $form_field = '')
{
    return <<<EOF
<script type="text/javascript">
function insert_smiley(smiley)
{
    document.{$form_name}.{$form_field}.value += " " + smiley;
}
</script>
EOF;
}

function get_clickable_smileys($image_url = '', $smileys = NULL)
{
    if ( ! is_array($smileys))
    {
        if (FALSE === ($smileys = _get_smiley_array()))
        {
            return $smileys;
        }
    }

    // Add a trailing slash to the file path if needed
    $image_url = preg_replace("/(.+?)\/*$/", "\\1/",  $image_url);

    $used = array();
    foreach ($smileys as $key => $val)
    {
        // Keep duplicates from being used, which can happen if the
        // mapping array contains multiple identical replacements.  For example:
        // :-) and :) might be replaced with the same image so both smileys
        // will be in the array.
        if (isset($used[$smileys[$key][0]]))
        {
            continue;
        }

        $link[] = "<a href=\"javascript:void(0);\" onClick=\"insert_smiley('".$key."')\"><img src=\"".$image_url.$smileys[$key][0]."\" width=\"".$smileys[$key][1]."\" height=\"".$smileys[$key][2]."\" alt=\"".$smileys[$key][3]."\" style=\"border:0;\" /></a>";

        $used[$smileys[$key][0]] = TRUE;
    }

    return $link;
}
function parse_smileys($str = '', $image_url = '', $smileys = NULL)
{
    if ($image_url == '')
    {
        return $str;
    }

    if ( ! is_array($smileys))
    {
        if (FALSE === ($smileys = _get_smiley_array()))
        {
            return $str;
        }
    }

    // Add a trailing slash to the file path if needed
    $image_url = preg_replace("/(.+?)\/*$/", "\\1/",  $image_url);

    foreach ($smileys as $key => $val)
    {
        $str = str_replace($key, "<img src=\"".$image_url.$smileys[$key][0]."\" width=\"".$smileys[$key][1]."\" height=\"".$smileys[$key][2]."\" alt=\"".$smileys[$key][3]."\" style=\"border:0;\" />", $str);
    }

    return $str;
}
function _get_smiley_array()
{
    if ( ! file_exists(APPPATH.'config/smileys'.EXT))
    {
        return FALSE;
    }

    include(APPPATH.'config/smileys'.EXT);


    if ( ! isset($config['smileys']) OR ! is_array($config['smileys']))
    {
        return FALSE;
    }

    return $config['smileys'];
}

