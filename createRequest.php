<?php

/****
   Copyright 2010 Department of Technology, City and County of San Francisco.
   Redistribution and use in source and binary forms, with or without
   modification, are permitted under certain conditions; see the file
   COPYING for details.
****/


/**
* Usage example: Create a new 311 service request.
*/


if(!defined("BASE_URL")){
	define("BASE_URL", "");

}
if(!defined("BASE_STATUS_URL")){
	define("BASE_STATUS_URL", "");
}
if(!defined("API_KEY"))
	define("API_KEY", "");
if(!defined("CITY_ID"))
	define("CITY_ID", "");


// Service request information.
$service_code = '021';
$lat = '37.76524078';
$lon = '-122.4212043';
$address_id = '';
$address_string = '123 Some Street, San Francisco, CA 94114';
$customer_email = 'abc@sample.com';
$device_id = 'none';
$account_id = '0123456789';
$first_name = '';
$last_name = '';
$phone_number = '5101234567';
$description = 'No description provided.';
$media_url = '';

try {
 if(isset($_FILES['fileupload']) && $_FILES['fileupload']['name'] != ''){
    include('fileUpload.php');
 }
// Create a new instance of the Open 311 class.
$open311 = new sf311(BASE_URL, API_KEY, CITY_ID);

if(isset($_REQUEST['email']))
    $customer_email = ($_REQUEST['email']);
if(isset($_REQUEST['fullname'])){
	$fullname = split(" ", ($_REQUEST['fullname']));
        $first_name = $fullname[0];
        $last_name = $fullname[count($fullname)-1];
}
if(isset($_REQUEST['phone']))
    $phone_number = str_replace(" ", "", $_REQUEST['phone']);

if(isset($_REQUEST['description']))
   $description = $_REQUEST['description'];
if(isset($_REQUEST['selected_address'])){
    $address_string = ($_REQUEST['selected_address']);
    $lat = '';
    $lon = '';
}
if(isset($_REQUEST['selected_service'])){
   $service_code = $_REQUEST['selected_service'];
}

if(isset($_REQUEST['selected_lat'])){
    $lat = $_REQUEST['selected_lat'];
    $lon = $_REQUEST['selected_lon'];
}

// Create a new 311 Service request.
$open311->createRequest($service_code, $lat, $lon, $address_string, $address_id, $customer_email, $device_id,
$account_id, $first_name, $last_name, $phone_number, $description, $media_url);

$createRequestXML = new SimpleXMLElement($open311->getOutput());

// Check to see if an error code and message were returned.
if(strlen($createRequestXML->errorCode) > 0) {
    throw new create_requestException("API Error message returned: ".$createRequestXML->open311_error->errorDescription);
}

$email_to_me = "Email tracking information!";

$status_url = BASE_STATUS_URL . "?ref=".$createRequestXML->request->service_request_id;
if($customer_email != "")
    $status_url .= "&email=".$customer_email;

echo ' <script language="Javascript"> var output_array = new Array();';
echo 'output_array[0]="'.$createRequestXML->request->service_request_id.'";'."\n";
echo 'output_array[1]="'.$_REQUEST['selected_service_name'].'";'."\n";
echo 'output_array[2]="'.$address_string.'";'."\n";
echo 'output_array[3]="'.str_replace("\n", " ", htmlentities($description)).'";'."\n";
echo 'output_array[4]="'.htmlentities($media_url).'";'."\n";
echo 'output_array[5]="'.$email_to_me.'";'."\n";
echo 'output_array[6]="'.str_replace("\n", " ", htmlentities($createRequestXML->request->service_notice)).'";'."\n";
echo 'output_array[7]="'.$address_string.'";'."\n";
echo 'output_array[8]="'.$customer_email.'";'."\n";
echo 'output_array[9]="'.$status_url.'";'."\n";
echo 'hasError = false;';
echo '</script>';
}
catch (create_requestException $ex) {
    //die("ERROR: ".$ex->getMessage());
    echo ' <script language="Javascript">';
    echo "hasError = true; ";
    echo '</script>';
    //die("ERROR: ".$ex->getMessage());
}
catch (Exception $ex) {
    //die("ERROR, a problem occured: ".$ex->getMessage());
}

?>
