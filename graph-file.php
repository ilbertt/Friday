<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require_once 'utils/class.main.php';
require_once 'utils/config.php';

$file = fopen('graph.json', 'w');

$sql = "SELECT * FROM `main` WHERE 1";
$result = $mysqli->query($sql);

    if ($result->num_rows > 0) {
            // output data of each row
        $content = "{ \"node\": [";
        
        $inarray = array();
        $outarray = array();
        
        while($row = $result->fetch_assoc()) {
            $inarray[] = $row['in'];
            $outarray[] = $row['out'];
        }
        
        foreach ($inarray as $input){
            
            $inlabel = intnum::fromNumber($input);
            $content .= "{\"id\": \"i$input\",\"label\": \"$inlabel\", \"radius\": 1, \"color\": \"#64DD17\"}, ";
            
        }
        
        foreach ($outarray as $output) {
            $outlabel = intnum::fromNumber($output);
            
            if($y === null){
                $content .= "{\"id\": \"o$output\",\"label\": \"$outlabel\", \"radius\": 1, \"color\": \"#64DD17\"}";
            } else{
                $content .= ", {\"id\": \"o$output\",\"label\": \"$outlabel\", \"radius\": 1, \"color\": \"#64DD17\"}";
            }
            
            $y++;
        }
        
        $content .= "], \"edge\":[";
        
        foreach ($inarray as $input1){
            
                
            if($x === null){
                $x = 0;
                $content .= "{\"source\": \"i$input1\", ";
            } else{
                $content .= ", {\"source\": \"i$input1\", ";
            }
            
            $output1 = $outarray[$x];
            $content .= "\"target\": \"o$output1\", \"linewidth\": 1, \"color\": \"#64DD17\"}";
            
            $x++;
        }
        
        $content .= "]}";
    } else{
        $content = 0;
    }

fwrite($file, $content);
fclose($file);