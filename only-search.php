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
    
    /*echo "$in";
    echo $out;*/
    
    $sql = "SELECT * FROM `main` WHERE `in` LIKE '%$in%'";
    $result = $mysqli->query($sql);

    if ($result->num_rows > 0) {
            // output data of each row
        while($row = $result->fetch_assoc()) {
            $output = $row["out"];
        }
        echo $output;
    } else {
        echo "Cosa dovrei rispondere?";
    }
}