<?php

/*********************************************************************************************************************************
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

********************************************************************************************************************************/


/**
*	Sends out a service request confirmation if user email address is provided
*/

$service_requested_id = $_REQUEST['service_id'];
$service_requested = $_REQUEST['service_requested'];
$desc = $_REQUEST['description'];
$location_requested = $_REQUEST['address'];
$media_url_requested = $_REQUEST['media_url'];
$visitormail = $_REQUEST['email'];
$service_level_agreement = $_REQUEST['service_agreement'];
$status_url = $_REQUEST['status_url'];


//if media url doesn't has a link in it, don't include.
if(strpos($media_url_requested, "http") < 1)
	$media_url_requested = "Media URL: ";

echo $status_url;
$todayis = date("l, F j, Y, g:i a") ;

$message = " $todayis \r\n
$service_requested_id \r\n
$service_level_agreement \r\n
$service_requested \r\n
$location_requested \r\n
$desc \r\n
$media_url_requested \r\n
Check status: $status_url \r\n
\r\n\r\n\r\n
This is an auto generated email, please do not reply.\r\n
";

$message = str_replace("<br>", "", $message);

$from = "From: \r\n";
$subject = "SF open311 service request summary";

//echo $message;
mail($visitormail, $subject, $message, $from);

?>



