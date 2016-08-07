<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
require_once 'utils/class.main.php';
require_once 'utils/config.php';

//require_once 'graph-file.php';

?>
<html>
    <head>
        <title>Friday</title>
        <link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
        <link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>
        <link href='utils/base.css' rel='stylesheet' type='text/css'>
        
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
        <script src="http://www.x3dom.org/download/x3dom.js"></script>
        <script src='utils/funcs.js' type='text/javascript'></script>
        <script src='utils/scene3d.jquery.js' type='text/javascript'></script>
        <script src='https://code.responsivevoice.org/responsivevoice.js'></script>
        <!--<script src="utils/speech/speakClient.js"></script>-->
        <!--<script src="utils/sigma/sigma.js"></script>
        <script src="utils/sigma/sigma.min.js"></script>
        <script src="utils/sigma/plugins/sigma.parsers.json.min.js"></script>-->
    </head>
    <body>
        <div class='row'>
            <div class="left">
                <h1><b>Friday</b></h1>
                <table class="table">
                    <thead>
                        <th>Id</th>
                        <th>Input</th>
                        <th>Output</th>
                        <th>Azioni</th>
                    </thead>
                    <tbody>
                        <?php
                        $sql = "SELECT * FROM `main` WHERE 1";
                        $result = $mysqli->query($sql);

                        if ($result->num_rows > 0) {
                                // output data of each row
                            while($row = $result->fetch_assoc()) {
                                $id = $row['id'];
                                $input = $row['in'];
                                $output = $row["out"];
                                
                                echo "<tr id='tr-$id'>"
                                        . "<td class='red'>$id</td>"
                                        . "<td class='white'><span id='in-text-$id'>$input</span><i class='material-icons edit-icon' data-inputid='$id'>&#xE3C9;</i></td>"
                                        . "<td class='green'><span id='out-text-$id'>$output</span><i class='material-icons edit-icon' data-outputid='$id'>&#xE3C9;</i></td>"
                                        . "<td style='text-align: center; cursor: pointer;' class='del'><i class='material-icons' data-delid='$id'>&#xE872;</i></td>"
                                        . "</tr>";
                            }
                        }
                        ?>
                    </tbody>
                </table>
                <!--<div id="friday-structure"></div>
                <script type='text/javascript'>
                    $(document).ready(function(){
                        var myCanvas = $('#friday-structure').scene3d({
                                                                width: "100%",	// canvas width (default is 150px)
                                                                height: "90%",	// canvas height (default is 150px)
                                                                fontSize: '0.5',
                                                                background: '#212121',
                                                                ViewpointPosition: '0,0,200'
                                                              }); // initialize your canvas
                                                              
                        $.getJSON( "graph.json", function( myGraph ) {	
                           myCanvas.addGraph({
                            layout: 'forcedirected',
                            forcedirected: { maxIterations: 100, timetick: 25 },
			    id: 'MyGraph',
                            data: myGraph,
                            width: 50,
                            height: 50,
                            depth: 50
                           });
                        });
                        
                    });
                </script>-->
            </div>
            <div class='right'>
                <div class='chat'>
                    
                </div>
                <div class="thinking">
                    <h3 style='color: white; margin-left: 10px;'>Penso...</h3>
                </div>
                <div class='user-elements'>
                    <input class='user' id='user-txt' type="text" placehoder='Parla con Friday...'>
                    <button class='button' id='send'>INVIA</button><br>
                    <button id="speak-btn" onclick="toggleStartStop()"></button>
                    
                    <script type="text/javascript">
                        
                        var recognizing;
                        var recognition = new webkitSpeechRecognition();
                        recognition.continuous = true;
                        reset();
                        recognition.onend = reset();

                        recognition.onresult = function (event) {
                          for (var i = event.resultIndex; i < event.results.length; ++i) {
                            if (event.results[i].isFinal) {
                              $('input').val(event.results[i][0].transcript);
                              $('#send').click();
                            }
                          }
                        }

                        function reset() {
                          recognizing = false;
                          $("#speak-btn").removeClass();
                          $('#speak-btn').addClass('btn-start');
                        }

                        function toggleStartStop() {
                          if (recognizing) {
                            recognition.stop();
                            reset();
                          } else {
                            recognition.start();
                            recognizing = true;
                            $("#speak-btn").removeClass();
                            $('#speak-btn').addClass('btn-stop');
                          }
                        }
                        //$('#speak-btn').click();
                        
                    </script>
                    <script>
                    var getVideo = false, getAudio = true;

                    navigator.getUserMedia = navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia ||
                            navigator.webkitGetUserMedia || navigator.msGetUserMedia);

                    function init() {
                        if(navigator.getUserMedia) {
                            navigator.getUserMedia({video:getVideo, audio:getAudio}, onSuccess, onError);
                        } else {
                            alert('getUserMedia failed.');
                        }
                    }

                    function onSuccess() {
                        console.log("Yay");
                    }

                    function onError(err) {
                        console.log("Noo " + err);
                    }
                    </script>
                </div>
            </div>
            <div id="audio"></div>
        </div>
    </body>
</html>