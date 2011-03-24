<?php


/***********************************************************************************************************************************
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

************************************************************************************************************************************/


/**
* Usage example: find synonym for a word
*/

define("BASE_URL", "http://encarta.msn.com/encnet/features/dictionary/DictionaryResults.aspx");
echo $_REQUEST["key_word"];
$request_url = BASE_URL. "?lextype=2&search=".$_REQUEST["key_word"];
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $request_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$output = curl_exec($ch);
$info= curl_getinfo($ch);
curl_close($ch);


$output = str_replace("class=\"ResultBody\"", "id=\"ResultBody\"", $output);

/*** a new dom object ***/
$dom = new domDocument;

/*** load the output html into the object ***/
$dom->loadHTML($output);

/*** discard white space ***/
$dom->preserveWhiteSpace = false;
$html = $dom->saveXML($dom->getElementById("ResultBody"));
$xml = simplexml_load_string($html);
//print_r($html);
$synonyms = str_replace(":", "",simplexml_import_dom($xml));
$result = $xml->xpath('/span/a/b');
$synonyms .= ", ";
while(list( , $node) = each($result)) {
    $synonyms .= $node->asXML().", ";
}
echo str_replace("</b>", "", str_replace("<b>", "", $synonyms));

?>
