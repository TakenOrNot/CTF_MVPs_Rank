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
        SWAM.on ( 'keydown', onKeydown );
        // TODO on CTF match started, wait 10 sec and check if we are in spec, if so lauch idletime, and if stayalive = true, launch also the countdown
        SWAM.on ( 'CTF_MatchStarted', onMatchStarted );
        
        $("#mvprank").click(function (){
            console.log("Rank clicked");

            calcmvps ()

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
    
    $('body').append ("<div id='mvprankcontainer' style='display: none;'><div id='mvprank' style='display: block; position: absolute;left: 50%;margin: 0px 0px 0px -125px;bottom: 4px;width: 150px;height: 25px;padding: 5px;background: rgba(0, 247, 0, 0.5);border-radius: 5px;text-align: center;color: #EEE;font-size: 15px;cursor: pointer;'>Rank</div></div>");

    

    
    function calcmvps () {
        parray = [];
        var data = {};
        // tbluescoresarray = [];
        // tredscoresarray = [];
        // tblueparray = [];
        // tredparray = [];
        
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
            
            data.plyrname = $( this ).children( ".name" ).children( ".player" ).text();
            
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
            // if k/d < 1, make it negative so a player with negative k/d and a cap has a lower score
            if (pkd < 1) { 
                pkd = -(1 - pkd); 
            }
            
            // TODO : use bounty somewhere
            // NOTE : probably use something like (bounty * k/d) to avoid meaningless bounty of kill-less players
            data.pscore = (pcaps * 1000) + ((pcaps * 1000) * pkd) + (pkd * 100) ;
            
            
            if ($( this ).children( ".name" ).children( ".player" ).hasClass("team-1")){
                console.log('team 1 blue');
                tbluecount = tbluecount + 1;
                tbluescore = tbluescore + data.pscore;
                tbluescoresarray.push(data.pscore);
                tblueparray.push(data.plyrname);
                
                tbluearray.push({"name" : data.plyrname, "score" : data.pscore});
                
            } else {
                console.log('team 2 red');
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
        
        // TODO : substract idle (spectating ones for now, hard to know who s idle) players scores from teamscore
        
        console.log("tbluescore : " + tbluescore + " tredscore : " + tredscore);
        if (tbluescore > tredscore) {
            scorediff = (tbluescore - tredscore);
            console.log("Blue stronger, score diff : " + scorediff); 
            var findClosest = tbluearray.reduce(function(prev, curr, index) {
                console.log(curr.name + " " + curr.score);
                return (Math.abs(curr.score - scorediff) < Math.abs(prev - scorediff) ? curr.score : prev);
            });
            
            shouldswitch = findClosest.name + " " + findClosest.score;
            // TODO : check if a switch wouldnt unbalance the game the other way around
            console.log("Should switch to red : " + shouldswitch + "(blueteam score would be : " + (tbluescore - findClosest.score) + ", redteam score would be:" + (tredscore + findClosest.score) + ")");
        } else if (tbluescore < tredscore) {
            scorediff = (tredscore - tbluescore);
            console.log("Red stronger, score diff : " + scorediff);
            var findClosest = tredarray.reduce(function(prev, curr, index) {
                console.log(curr.name + " " + curr.score);
                return (Math.abs(curr.score - scorediff) < Math.abs(prev - scorediff) ? curr.score : prev);
            });
            shouldswitch = findClosest.name + " " + findClosest.score;
            // TODO : check if a switch wouldnt unbalance the game the other way around
            console.log("Should switch to blue : " + shouldswitch+ "(redteam score would be : " + (tredscore - findClosest.score) + ", blueteam score would be:" + (tbluescore + findClosest.score) + ")");
        }
        
        
        
        
        
    };
    
    SWAM.on ( 'gamePrep', function (){
        
        $("#mvprankcontainer").css({display: "none"});
    });
    
    
    
    function onKeydown ( event ) {
        
        if ( event.originalEvent.key === 'v' ) { //note: This is not reliable to know if player is actually spectating

            event.stopImmediatePropagation ();
            
            // game.spectatingID is not reliable, as it is null at first when spectating, until we spectate another player      
            checkspecdelay = 2000;
            checkspec(checkspecdelay)
               
            
        }
        
            
               
            
        }
        
    
    
    function onMatchStarted () {
        checkspecdelay = 10000;
        checkspec(checkspecdelay)
    }
    
    function checkspec(checkspecdelay){
        window.setTimeout(function () {
                    if( $('#btnFreeSpectator').css('display') == 'block' ) {
                        console.log("v key pressed, show sf");
                        $("#mvprankcontainer").css({display: "block"});
                        
                    }
                },checkspecdelay); 
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