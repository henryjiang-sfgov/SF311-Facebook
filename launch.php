
/****
   Copyright 2010 Department of Technology, City and County of San Francisco.
   Redistribution and use in source and binary forms, with or without
   modification, are permitted under certain conditions; see the file
   COPYING for details.
****/



<script type="text/javascript">
function submitSearch() {
	 //client_id = your facebook app id, redirect_uri = your facebook app url
	 location = "https://graph.facebook.com/oauth/authorize?client_id=&redirect_uri=&type=user_agent&display=popup&scope=email";
	 document.setLocation(location);
}


</script>

<?php
//var_dump($_REQUEST);
include("launch.html");

?>
