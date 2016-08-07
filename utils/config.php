<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$db_host = "localhost"; //Host address (most likely localhost)
$db_name = "friday"; //Name of Database
$db_user = "root"; //Name of database user
$db_pass = "Ozzuseiunmito1"; //Password for database user

/* Create a new mysqli object with database connection parameters */
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);

if(mysqli_connect_errno()) {
	echo "Connection Failed: " . mysqli_connect_errno();
	exit();
}