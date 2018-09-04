// ------------------------------------------------------------------------
//   Stay Alive for StarMash
// ------------------------------------------------------------------------
!function () {
    /* INIT */
    function init () {
        console.log('init CTF_MVPs_Rank');
        initEvents ();
        
    }

    function initEvents () {
        
        SWAM.on ( 'CTF_MatchStarted', onMatchStarted );
        
        $("#mvprank").click(function (){
            console.log("Rank clicked");
            $('#scoredetailed .spacer').first().hide();
            $("#scorecontainer").hide();
            $( "#scoretable" ).hide();
            $("#scoremvp").hide();
            $("#defaultscoreboardbtn").show();
            $("#mvprankcontainer").css({display: "block"});
            
            calcmvps ()

        });
        
        $("#defaultscoreboardbtn").click(function (){
            //console.log("defaultscoreboard clicked");
            $(this).hide();
            $("#mvprankcontainer").css({display: "none"});
            $('#scoredetailed .spacer').first().show();
            $("#scorecontainer").show();
            $( "#scoretable" ).show();
            $("#scoremvp").show();
        });
    }
    
    SWAM.on ( 'gameLoaded', init );
    
    jQuery.fn.justtext = function() {
  
        return $(this)	.clone()
                .children()
                .remove()
                .end()
                .text();

    };
    
    
    /* GUI */
    
    $( "#scoredetailed .header" ).append("<div id='mvprankbtnscontainer' style=''><div id='mvprank' style='display: block; width: 150px;height: 25px;padding: 5px;background: rgba(0, 247, 0, 0.5);border-radius: 5px;text-align: center;color: #EEE;font-size: 15px;cursor: pointer;position: absolute;right: 10px; top:10px;'>Rank</div><div id='defaultscoreboardbtn' style='display: none; width: 150px;height: 25px;padding: 5px;background: rgba(0, 247, 0, 0.5);border-radius: 5px;text-align: center;color: #EEE;font-size: 15px;cursor: pointer;position: absolute;left: 10px; top:10px;'>ScoreBoard</div></div>");

    $( "#scorecontainer" ).after( "<div id='mvprankcontainer' style='display:none;max-height: 310px;overflow:auto;'><div class='item head' id='ranktable'><div class='name'>&nbsp;</div><div class='captures'>&nbsp;</div><div class='kd' style='display:inline-block; width:13%;'>KD</div><div class='cd' style='display:inline-block; width:13%;'>CD</div><div class='score' style='display:inline-block;width: 23%;text-align: right;'>Score</div><div class='spacer'></div></div><ul id='mvprankplayerlist' style='list-style-type: none;padding-left: 0px;'></ul><div id='teamscores'></div><div id='advice'></div></div>" );
    
    

    function calcmvps () {
        parray = [];
        var data = {};
        tbluescoresarray = [];
        tredscoresarray = [];
        tblueparray = [];
        tredparray = [];
        
        tbluearray = [];
        tredarray = [];
        
        tbluecount = 0;
        tbluescore = 0;
        tredcount = 0;
        tredscore = 0;
        
        $( "#scorecontainer .item" ).each(function( index ) {
        
            var data = {};
            console.log( index + ": " + $( this ).text() );
            data.plyrid = $( this ).attr('player-id');
            
            data.plyrname = $( this ).children( ".name" ).children( ".player" ).text().replace('>','').replace('<','');
            
            console.log( index + " plyrname: " + data.plyrname);
            
            
            
            pkills = $( this ).children( ".kills" ).text();
            pdeaths = $( this ).children( ".deaths" ).text();
            pcaps = $( this ).children( ".captures" ).text();
            // gota ask statsbot
            // precapskills = 
            // precapsreturns = 
            // pgamesplayed = 
            
            // avoid infinity ratio if deaths = 0
            if (pdeaths == 0){
                console.log( index + ": deaths count correction");
                pdeaths = 1;
            }
            // correct caps count if caps = 0
            if (pcaps == ' '){
                console.log( index + ": caps count correction");
                pcaps = 0;
            }
            
            pkd = (pkills / pdeaths);
            data.pkd = pkd;
            // if k/d < 1, make it negative so a player with negative k/d and a cap has a lower score
            if (pkd < 1) { 
                pkd = -(1 - pkd); 
            }
            
            // TODO: use cap/death ratio instead of caps
            
            pcd = (pcaps / pdeaths); 
            data.pcd = pcd;
            //if (pcd < 1) { 
            //    pcd = -(1 - pcd); 
            //}
            
            pcapscore = pcd;
            
            // TODO : use bounty somewhere
            // NOTE : probably use something like (bounty * k/d) to avoid meaningless bounty of kill-less players
            
            
            //data.pscore = (pcaps * 1000) + ((pcaps * 1000) * pkd) + (pkd * 100) ;
            
            
            data.pscore = Math.trunc(((pcapscore * 1000) * pkd) + (pkd * 100)); 
            
            
            if ($( this ).children( ".name" ).children( ".player" ).hasClass("team-1")){
                console.log('team 1 blue');
                data.pteam = 'team-1';
                tbluecount = tbluecount + 1;
                tbluescore = tbluescore + data.pscore;
                tbluescoresarray.push(data.pscore);
                tblueparray.push(data.plyrname);
                
                tbluearray.push({"name" : data.plyrname, "score" : data.pscore});
                
            } else {
                console.log('team 2 red');
                data.pteam = 'team-2';
                tredcount = tredcount + 1;
                tredscore = tredscore + data.pscore;
                tredscoresarray.push(data.pscore);
                tredparray.push(data.plyrname);
                
                tredarray.push({"name" : data.plyrname, "score" : data.pscore});
                
            }
            
            
            
            console.log( index + " kd: " + pkd );
            console.log( index + " score: " + data.pscore );
            parray.push(data);
        });
        
        sortedarr = parray.sort(function(obj1, obj2) {
            // Ascending:
            return obj1.pscore - obj2.pscore;
        }).reverse();    
        console.log(sortedarr);
        
        tbluearray.sort(function(obj1, obj2) {
            // Ascending:
            return obj1.score - obj2.score;
        }).reverse();
        tredarray.sort(function(obj1, obj2) {
            // Ascending:
            return obj1.score - obj2.score;
        }).reverse();
        
        // TODO : substract idle (spectating ones for now, hard to know who s idle) players scores from teamscore
        
        console.log("tbluescore : " + tbluescore + " tredscore : " + tredscore);
        
        
        function findClosest(array,num){
            var ansc;
            var c=0;
            var i=0;
            var minDiff=100000;
            var ans;
            for(i in array){
                console.log(array[i]);
                 var m=Math.abs(num-array[i]);
                 if(m<minDiff){ 
                        minDiff=m; 
                        ans=array[i];
                        ansc= c;
                    }
                c= c + 1;
              }
            console.log("i ans : " + ans + " ansc :" + ansc);
            return ansc;
        }
        
        shouldswitchsentence = '';
        shouldswitch = '';
        
        if (tbluescore > tredscore) {
            scorediff = (tbluescore - tredscore);
            console.log("Blue stronger, score diff : " + scorediff); 
            //var findClosest = tbluearray.reduce(function(prev, curr, index) {
            //    console.log(curr.name + " " + curr.score + " (prev : " + prev.score);
            //    return (Math.abs(curr.score - scorediff) < Math.abs(prev - scorediff) ? curr.score : prev);
            //});
            shouldswitch = findClosest(tbluescoresarray,scorediff);
           
            //shouldswitch = findClosest.name + " " + findClosest.score;
            // TODO : check if a switch wouldnt unbalance the game the other way around
            ntredscore = (tredscore + tbluescoresarray[shouldswitch]);
            ntbluescore = (tbluescore - tbluescoresarray[shouldswitch]);
            
            if (ntbluescore > ntredscore) {
                nscorediff = (ntbluescore - ntredscore);
            } else if (ntbluescore < ntredscore) {
                nscorediff = (ntredscore - ntbluescore);
            }
            
            shouldswitchsentence = "Should switch to Red : " + tblueparray[shouldswitch] + " (Blue => " +  ntbluescore + ", Red => " + ntredscore + " scorediff : " + scorediff + " => " + nscorediff + " )";
            console.log(shouldswitchsentence);
            
            
            if (nscorediff > scorediff) {
                console.log("a switch would make it unbalanced the other way around");
            }
            
        } else if (tbluescore < tredscore) {
            scorediff = (tredscore - tbluescore);
            console.log("Red stronger, score diff : " + scorediff);
            //var findClosest = tredarray.reduce(function(prev, curr, index) {
            //    console.log(curr.name + " " + curr.score + " (prev : " + prev.score);
            //    return (Math.abs(curr.score - scorediff) < Math.abs(prev - scorediff) ? curr.score : prev);
            //});
            shouldswitch = findClosest(tredscoresarray,scorediff);
            //findClosest(tredarray,scorediff);
            //shouldswitch = findClosest.name + " " + findClosest.score;
            // TODO : check if a switch wouldnt unbalance the game the other way around
            ntredscore = (tredscore - tredscoresarray[shouldswitch]);
            ntbluescore = (tbluescore + tredscoresarray[shouldswitch]);
            
            if (ntbluescore > ntredscore) {
                nscorediff = (ntbluescore - ntredscore);
            } else if (ntbluescore < ntredscore) {
                nscorediff = (ntredscore - ntbluescore);
            }
            
            shouldswitchsentence = "Should switch to Blue : " + tredparray[shouldswitch] + " (Red => " +  ntredscore + ", Blue => " + ntbluescore + " scorediff : " + scorediff + " => " + nscorediff + " )";
            console.log(shouldswitchsentence);
            
            
            
            if (nscorediff > scorediff) {
                // TODO : get second best player of strongest team
                console.log("a switch would make it unbalanced the other way around");
            }
            
        }
        
        
        $("#mvprankplayerlist").html('');
        $.each(sortedarr, function( index, value ) {
            $("#mvprankplayerlist").append("<li class='item'><div class='name'><div class='position'>" + (index + 1) + ".</div> <div class='player " + value.pteam + "'> " + value.plyrname + "</div></div><div class='captures'>&nbsp;</div><div class='kd' style='width:13%; display: inline-block;'>" + value.pkd + "</div><div class='kd' style='width:13%; display: inline-block;'>" + value.pcd + "</div><div style='float:right;padding-right: 2em;'>" + value.pscore + "</div></li>");
        });
        $("#teamscores").html('');
        $("#teamscores").html("Blue : " + tbluescore + " Red:" + tredscore);
        $("#advice").html('');
        $("#advice").html(shouldswitchsentence);
    };
    
    SWAM.on ( 'gamePrep', function (){
        
        //$("#mvprankcontainer").css({display: "none"});
    });
    
    
    

        
    
    
    function onMatchStarted () {
        // checkspecdelay = 10000;
        // checkspec(checkspecdelay)
    }


    /* REGISTER */

    SWAM.registerExtension ({
        name: 'CTF_MVPs_Rank',
        id: 'CTF_MVPs_Rank',
        description: '',
        version: '1.0.0',
        author: 'xplay'
    });
    
}();