<?php

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

$service_list = array();
include_once("serviceList.php");
include("header.html");

//build the service list array;
echo '<script language="Javascript"> var service_list_array = new Array();';
$counter = 0;

//order by rank
sort_service_list($service_list);

echo '</script>';

if(isset($_REQUEST['selected_service']) && $_REQUEST['selected_service'] != ''){
    include("createRequest.php");
}

//Google map key, enter keys for multiple host.
if(isset($_SERVER['HTTP_X_FORWARDED_HOST']) && strpos("apps.sfgov.org", $_SERVER['HTTP_X_FORWARDED_HOST']) > -1){
	echo '<script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key="></script>';
    echo '<script src="http://www.google.com/jsapi?key="></script>';
}
else if($_SERVER['SERVER_NAME'] == 'localhost'){
	echo '<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key="></script>';
    echo '<script type="text/javascript" src="http://www.google.com/jsapi?key="></script>';
}
else if($_SERVER['SERVER_NAME'] == 'open311.sfgov.org'){
	echo '<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key="></script>';
    echo '<script type="text/javascript" src="http://www.google.com/jsapi?key="></script>';
}
else {
	echo '<script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key="></script>';
    echo '<script src="http://www.google.com/jsapi?key="></script>';
}

include("body.html");

require("facebook/src/facebook.php");
//facebook authentication
$facebook = new Facebook(array(
  'appId'  => '', //enter your FB app id
  'secret' => '', //enter your FB app secret id
  'cookie' => true, // enable optional cookie support
  'ext_perm' => 'email, publish_stream',
));

$session = $facebook->getSession();

$me = null;
// Session based API call.
if ($session) {
  try {
    $uid = $facebook->getUser();
    $me = $facebook->api('/me');
    $access_token = $facebook->getAccessToken();
  } catch (FacebookApiException $e) {
    error_log($e);
  }
}


//populate fields with your facebook profile info.
if($me){
	echo '<script language="Javascript"> document.getElementById("fullname").value="'.$me['name'] .'"; document.getElementById("email").value="'.$me['email'].'";</script>';
}

// We want to display services by usage so that most often used services appear on the top of the list.`
function sort_service_list($service_list)
{
	$counter = 0;
        //rank of service list in order
        $orders = array(24,15,9,26,11,21,25,1,6,4,20,19,29,8,16,27,3,9,17,18,2,378,10,7,375,5,377,376,12,13,22,23,28,30,31,32);

        foreach($orders as $order){
        		foreach($service_list as $service){
        			if($service->service_code == $order){
                		echo "service_list_array[".$counter."]"."=[\"".$service->service_code."\",\"".str_replace("_", " ", $service->service_name)."\",\"".str_replace('"', '\"', trim($service->description)) ."\"];"."\n"; break;
                	}
                }
                $counter++;
        }

}

?>


