<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require_once 'utils/class.main.php';
require_once 'utils/config.php';

if(isset($_POST)){
    $in = $_POST['ining'];
    $out = $_POST['outing'];
    $q = $_POST['question'];
    $del = $_POST['del'];
    $edit = $_POST['edit'];
    
    if($del === 'true'){
        $delid = $_POST['delid'];
        $delsql = "DELETE FROM main WHERE id='$delid'";

        if ($mysqli->query($delsql) === TRUE) {
            echo "OK";
        } else {
            echo "Error deleting record: " . $conn->error;
        }
    } elseif($edit === 'true'){
        $editid = $_POST['editid'];
        $field = $_POST['field'];
        
        if($field === 'in'){
            $intxt = $_POST['newin'];
            $editsql = "UPDATE `main` SET `in`='$intxt' WHERE `id`=$editid";

            if ($mysqli->query($editsql) === TRUE) {
                echo "OK";
            } else {
                echo "Error updating record: " . $mysqli->error;
            }
            
        } elseif ($field === 'out'){
            $outtxt = $_POST['newout'];
            $editsql = "UPDATE `main` SET `out`='$outtxt' WHERE `id`=$editid";

            if ($mysqli->query($editsql) === TRUE) {
                echo "OK";
            } else {
                echo "Error updating record: " . $mysqli->error;
            }
        }
    } else{
    
        /*echo "$in";
        echo $out;*/
        if(strpos($in, "cos'è") !== false | strpos($in, 'cosa') !== false | strpos($in, 'cerca') !== false | strpos($in, "che cos'") !== false){
            $in1 = str_replace("'", " ", $in);//elimina eventuali apostrofi prima della parola da cercare (ex: l'entropia -> l entropia)
            $in2 = str_replace("?", "", $in1); //elimina eventuali punti di domanda dalla frase
            $strpieces = explode(" ", $in2); //divide la frase secondo gli spazi e a mette in un array
            
            $in = end($strpieces); //imposto il valore $in all'ultima parola dell'array $strpieces
            $startsearch = true;
            //echo $in;
        }

        $sql = "SELECT * FROM `main` WHERE `in` LIKE '%$in%'";
        $result = $mysqli->query($sql);

        if ($result->num_rows !== null) {
            // output data of each row
            while($row = $result->fetch_assoc()) {
                $output = $row["out"];
            }
            if($startsearch){ //se esiste già una risposta alla ricerca
                echo "$output <br> Continuo?"; //se esiste già una risposta
            } else{
                echo $output;
            }
        } else {
            if($q === 'true'){ //dopo la domanda "Cosa dovrei rispondere?"
                echo "OK!";
                if ($out !== '0'){
                    $sqlinto = "INSERT INTO `main` (`in`, `out`) VALUES ('$out', '$in')";

                    if ($mysqli->query($sqlinto) === TRUE) {
                        
                    } 
                    else {
                        echo "C'è stato un errore...$mysqli->error";
                    }
                }
            } elseif($startsearch){
                $webquery = $in;

                $searchurl = "https://it.wikipedia.org/w/api.php?action=opensearch&search=$webquery&limit=1&namespace=0&format=json";

                $body = file_get_contents($searchurl);
                $json = json_decode($body);

                $resulturl = $json->responseData->results[0]->url;
                $resultcnt = strip_tags($json->responseData->results[0]->content);

                $todbin = $lastchar;
                $todbout = $resultcnt;

                $sqlinto2 = "INSERT INTO `main` (`in`, `out`, `link`) VALUES ('$todbin', '$todbout', '$resulturl')";

                    if ($mysqli->query($sqlinto2) === TRUE) {
                        echo "$resultcnt<br>Continuo?";
                    } 
                    else {
                        echo "C'è stato un errore...$mysqli->error";
                    }

            } else{
                echo "Cosa dovrei rispondere?";
            }

        }
    
    }
    
}