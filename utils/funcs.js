/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var q = 0;
$(document).ready(function(){
    
var x = 0;
$('#send').click(function(){
    var usertxt = $('#user-txt').val();
    if(usertxt !== null){
        $('.thinking').show();
        var prectxt = $('.chat').html();
        
        usertxt = usertxt.toLowerCase();
        
        var nexttxt = capitalizeFirstLetter(usertxt);
        
        var toVideo1 = prectxt+"<br><span class='chatelement' id='u"+x+"' style='color: white;'>"+nexttxt+"</span>";
        $('.chat').html(toVideo1);
        
        if(usertxt === 'nulla' || usertxt === 'niente' || usertxt === 'lascia stare' || usertxt === 'lascia perdere'){
            $('.thinking').hide();
            $('#user-txt').val('');

            x++;
            var toVideo2 = toVideo1+"<br><span class='chatelement' id='f"+x+"'>OK!</span>";
            $('.chat').html(toVideo2);
            responsiveVoice.speak('OK!', "Italian Female");
        }else{
            var lastfriday = $('#f'+x).text();
            if(lastfriday !== null){
                lastfriday = lastfriday.toLowerCase();
                console.log(lastfriday);
                if(lastfriday === 'cosa dovrei rispondere?'){
                    var q = 'true';
                    var y = x - 1;
                    lastfriday = $('#u'+y).text().toLowerCase();
                } else{
                    var q = 'false';
                }

            } else{
                lastfriday = 0;
            }

            console.log(usertxt,y,lastfriday,q);

            if(lastfriday !== 'ok!'){
                $.post("main.php", {ining: usertxt, outing: lastfriday, question: q}, function (output){
                   $('.thinking').hide();
                   $('#user-txt').val('');

                   var fromfriday = capitalizeFirstLetter(output);
                   /*var u = new SpeechSynthesisUtterance();
                     u.text = fromfriday;
                     u.lang = 'it-IT';
                     u.rate = 1.2;
                     u.onend = function(event) { alert('Finished in ' + event.elapsedTime + ' seconds.'); }
                     speechSynthesis.speak(u);*/
                   responsiveVoice.speak(fromfriday, "Italian Female");
                   x++;
                   var toVideo2 = toVideo1+"<br><span class='chatelement' id='f"+x+"'>"+fromfriday+"</span>";
                   $('.chat').html(toVideo2);
                });
            } else{
                $.post("only-search.php", {ining: usertxt, outing: lastfriday}, function (output){
                   $('.thinking').hide();
                   $('#user-txt').val('');

                   var fromfriday = capitalizeFirstLetter(output);
                   
                   responsiveVoice.speak(fromfriday, "Italian Female");
                   x++;
                   var toVideo2 = toVideo1+"<br><span class='chatelement' id='f"+x+"'>"+fromfriday+"</span>";
                   $('.chat').html(toVideo2);
                });
            }
        }
    }
});
    
$("#user-txt").keypress(function(e) {
    if(e.which === 13) {
        $("#send").click();
    }
});

$('.del').click(function(ev){
    var id = $(this).children().attr('data-delid');
    var r = confirm("Vuoi veramente cancellare la riga con id:"+id+"?");
    if (r === true) {
        $.post("main.php", {del: 'true', delid: id}, function (output){
            if(output === 'OK'){
                $('#tr-'+id).remove();
            } else{
                alert(output);
            }
        });
    }
});
$('.white').click(function(ev){
    var id = $(this).find('.edit-icon').attr('data-inputid');
    var txt = $(this).find('#in-text-'+id).text();
    var r = prompt("Modifica questo campo:", txt);
    if (r !== null) {
        $.post("main.php", {edit: 'true', field: 'in', editid: id, newin: r}, function (output){
            if(output === 'OK'){
                var spanid = '#in-text-'+id;
                $(spanid).text(r);
            } else{
                alert(output);
            }
        });
    }
});
$('.green').click(function(ev){
    var id = $(this).find('.edit-icon').attr('data-outputid');
    var txt = $(this).find('#out-text-'+id).text();
    var r = prompt("Modifica questo campo:", txt);
    if (r !== null) {
        $.post("main.php", {edit: 'true', field: 'out', editid: id, newout: r}, function (output){
            if(output === 'OK'){
                var spanid = '#out-text-'+id;
                $(spanid).text(r);
            } else{
                alert(output);
            }
        });
    }
});
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}