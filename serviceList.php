<?php

/****
   Copyright 2010 Department of Technology, City and County of San Francisco.
   Redistribution and use in source and binary forms, with or without
   modification, are permitted under certain conditions; see the file
   COPYING for details.
****/



/**
* Usage example: Get a list of 311 services.
*/

// Include the Open 311 classes.
include_once('classes/sf311.php');

define("SERVICELIST_URL", "");
define("API_KEY", "");
define("CITY_ID", "");

try {

// Create a new instance of the Open 311 class.
$open311 = new sf311(SERVICELIST_URL, API_KEY, CITY_ID);

// Get a list of service types and descriptions.
$open311->selectService();
$serviceTypesXML = new SimpleXMLElement($open311->getOutput());

// Check to see if an error code and message were returned.
if(strlen($serviceTypesXML->Open311Error->errorCode) > 0) {
throw new service_listException("API Error message returned: ".$serviceTypesXML->Open311Error->errorDescription);
}

// Loop through each service type and write out the code, name and description.
// Construct an array for later use

foreach ($serviceTypesXML->service as $service) {
    //echo $service->service_code.": ".$service->service_name.": ".$service->description."<br />";
    array_push($service_list, $service);
}

}

catch (service_listException $ex) {
//die("ERROR: ".$ex->getMessage());
}

catch (Exception $ex) {
//die("Sorry, a problem occured: ".$ex->getMessage());
}

?>
