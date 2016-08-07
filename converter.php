<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require_once 'utils/class.main.php';

if(isset($_GET)){
    $str = $_GET['str'];
    $num = $_GET['num'];
}

if($str === null){
    $string = fromNumber($num);
    echo $string;
} elseif ($num === null) {
    $number = fromString($str);
    echo $number;
}