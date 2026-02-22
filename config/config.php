<?php

//report all type of errors
error_reporting(-1);

// Display all errors
ini_set('display_errors', '1');

// Start named session based on path to file.
$name = preg_replace("/[^a-z\d]/i", "", __DIR__);
session_name($name);
session_start();

// Include the functions.php file
include('../src/functions.php');

include('../src/calendar.php');
