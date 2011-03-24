/****
   Copyright 2010 Department of Technology, City and County of San Francisco.
   Redistribution and use in source and binary forms, with or without
   modification, are permitted under certain conditions; see the file
   COPYING for details.
****/


<?php
/*** Amazon S3 hosted files ***/
//$aws_key = '';
//$aws_secret = '';

$file_name = split("\.", $_FILES['fileupload']['name']);
$file_ext = $file_name[count($file_name) - 1];

$source_file = realpath($_FILES['fileupload']['tmp_name']);
$aws_object = $_FILES['fileupload']['tmp_name'].".".$file_ext;

//$source_file = 'open311_header.gif'; // file to upload to S3
//$aws_object = 'open311_header.gif';         // AWS object name (file name)

$file_type = "image/gif";  // or other file type like "image/jpeg" for JPEG image,
                           // or "binary/octet-stream" for binary file

$aws_bucket = 'open311'; // AWS bucket


if (strlen($aws_secret) != 40) die("$aws_secret should be exactly 40 bytes long");
$file_data = file_get_contents($source_file);
if ($file_data == false) die("Failed to read file ".$source_file);


// opening HTTP connection to Amazon S3
$fp = fsockopen("s3.amazonaws.com", 80, $errno, $errstr, 30);
if (!$fp) {
    die("$errstr ($errno)\n");
}


// Creating or updating bucket

$dt = gmdate('r'); // GMT based timestamp

// preparing String to Sign    (see AWS S3 Developer Guide)
$string2sign = "PUT


{$dt}
/{$aws_bucket}";

// preparing HTTP PUT query
$query = "PUT /{$aws_bucket} HTTP/1.1
Host: s3.amazonaws.com
Connection: keep-alive
Date: $dt
Authorization: AWS {$aws_key}:".amazon_hmac($string2sign)."\n\n";

$resp = sendREST($fp, $query);
if (strpos($resp, '<Error>') !== false)
    die($resp);

//echo "BUCKET created\n";
// done


// Uploading object
$file_length = strlen($file_data); // for Content-Length HTTP field

$dt = gmdate('r'); // GMT based timestamp
// preparing String to Sign    (see AWS S3 Developer Guide)
$string2sign = "PUT

{$file_type}
{$dt}
x-amz-acl:public-read
/{$aws_bucket}/{$aws_object}";

// preparing HTTP PUT query
$query = "PUT /{$aws_bucket}/{$aws_object} HTTP/1.1
Host: s3.amazonaws.com
x-amz-acl: public-read
Connection: keep-alive
Content-Type: {$file_type}
Content-Length: {$file_length}
Date: $dt
Authorization: AWS {$aws_key}:".amazon_hmac($string2sign)."\n\n";
$query .= $file_data;

$resp = sendREST($fp, $query);
if (strpos($resp, '<Error>') !== false)
    die($resp);

//echo "FILE uploaded\n";
// done

//echo "Your file's URL is:  http://s3.amazonaws.com/{$aws_bucket}/{$aws_object}\n";
$media_url = "http://s3.amazonaws.com/{$aws_bucket}/{$aws_object}";
fclose($fp);



// Sending HTTP query and receiving, with trivial keep-alive support
function sendREST($fp, $q, $debug = false)
{
    if ($debug) echo "\nQUERY<<{$q}>>\n";

    fwrite($fp, $q);
    $r = '';
    $check_header = true;
    while (!feof($fp)) {
        $tr = fgets($fp, 256);
        if ($debug) echo "\nRESPONSE<<{$tr}>>";
        $r .= $tr;

        if (($check_header)&&(strpos($r, "\r\n\r\n") !== false))
        {
            // if content-length == 0, return query result
            if (strpos($r, 'Content-Length: 0') !== false)
                return $r;
        }

        // Keep-alive responses does not return EOF
        // they end with \r\n0\r\n\r\n string
        if (substr($r, -7) == "\r\n0\r\n\r\n")
            return $r;
    }
    return $r;
}

// hmac-sha1 code START
// hmac-sha1 function:  assuming key is global $aws_secret 40 bytes long
// read more at http://en.wikipedia.org/wiki/HMAC
// warning: key($aws_secret) is padded to 64 bytes with 0x0 after first function call
function amazon_hmac($stringToSign)
{
    // helper function binsha1 for amazon_hmac (returns binary value of sha1 hash)
    if (!function_exists('binsha1'))
    {
        if (version_compare(phpversion(), "5.0.0", ">=")) {
            function binsha1($d) { return sha1($d, true); }
        } else {
            function binsha1($d) { return pack('H*', sha1($d)); }
        }
    }

    global $aws_secret;

    if (strlen($aws_secret) == 40)
        $aws_secret = $aws_secret.str_repeat(chr(0), 24);

    $ipad = str_repeat(chr(0x36), 64);
    $opad = str_repeat(chr(0x5c), 64);

    $hmac = binsha1(($aws_secret^$opad).binsha1(($aws_secret^$ipad).$stringToSign));
    return base64_encode($hmac);
}
// hmac-sha1 code END

?>
