// ------------------------------------------------------------------------
//   CTF MVP Rank for StarMash
// ------------------------------------------------------------------------
!function () {
    /* INIT */
    function init () {
        console.log('init CTF_MVPs_Rank');
        initEvents ();
        initHTML ();
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
        
        $("#chartbtn").click(function (){
            if (!calcinterval){
                var calcinterval = setInterval(calcmvps, 60000); 
            }
            
        });
        
    }
    
    function initHTML () {
        const headhtml = `<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.min.js"></script>`
        
        $('head').append ( headhtml );
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

    $( "#scorecontainer" ).after( "<div id='mvprankcontainer' style='display:none;max-height: 310px;overflow:auto;'><div id='teamscores' style='font-size: 200%;'></div><div id='advice'></div><div id='chartbtn' style='display: block; width: 150px;height: 25px;padding: 5px;background: rgba(0, 247, 0, 0.5);border-radius: 5px;text-align: center;color: #EEE;font-size: 15px;cursor: pointer;'>Chart</div><div class='item head' id='ranktable'><div class='name'>&nbsp;</div><div class='captures'>&nbsp;</div><div class='kd' style='display:inline-block; width:13%;'>KD</div><div class='cd' style='display:inline-block; width:13%;'>CD</div><div class='score' style='display:inline-block;width: 23%;text-align: right;'>Score</div></div><div class='spacer'></div><ul id='mvprankplayerlist' style='list-style-type: none;padding-left: 0px; margin-top:0px;'></ul></div>" );
    
    /* SCORE CALC */
    
    
    tredscorelog = [];
    tbluescorelog = [];
    tredscorelogcalcs = [];
    tbluescorelogcalcs = [];
    ctscorelogarray = [];
    ctscorelog = 0; 
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
            plvl = $( this ).children( ".rank" ).text();
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
            
            if (plvl == 'nbsp;'){
                plvl = 0;
            }
            
            pkd = (pkills / pdeaths);
            data.pkd = Math.round(pkd * 100) / 100;
            // if k/d < 1, make it negative so a player with negative k/d and a cap has a lower score
            // if (pkd < 1) { 
            //     pkd = -(1 - pkd); 
            //}
            
            // use cap/death ratio instead of caps
            
            pcd = (pcaps / pdeaths); 
            data.pcd = Math.round(pcd * 100) / 100;
            //if (pcd < 1) { 
            //    pcd = -(1 - pcd); 
            //}
            
            pcapscore = pcd;
            
            // TODO : use bounty somewhere
            // NOTE : probably use something like (bounty * k/d) to weaken meaningless bounty of weak players
            // who won bounty mainly from team win
            // AND check if player has kills, if not, dont count it at all
            // TODO : substract idle (spectating ones for now, hard to know who s idle) players scores from teamscore
            // NOTE : maybe divide spectating player score by 2 as they can come back anytime
            
            // Obsolete : data.pscore = (pcaps * 1000) + ((pcaps * 1000) * pkd) + (pkd * 100) ;

            
            
            data.pscore = Math.trunc(((pcapscore * 1000) * pkd) + (pkd * 100) + (plvl * 5)); 
            
            
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
        
        // End $( "#scorecontainer .item" ).each
        
        
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
        // NOTE : maybe divide spectating player score by 2 as they can come back anytime
        
        console.log("tbluescore : " + tbluescore + " tredscore : " + tredscore);
        
        // Advice about player switch
        
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

            shouldswitch = findClosest(tbluescoresarray,scorediff);
           
            ntredscore = (tredscore + tbluescoresarray[shouldswitch]);
            ntbluescore = (tbluescore - tbluescoresarray[shouldswitch]);
            
            if (ntbluescore > ntredscore) {
                nscorediff = (ntbluescore - ntredscore);
            } else if (ntbluescore < ntredscore) {
                nscorediff = (ntredscore - ntbluescore);
            }
            
            shouldswitchsentence = "Should switch to Red : " + tblueparray[shouldswitch] + " (Blue => " +  ntbluescore + ", Red => " + ntredscore + " scorediff : " + scorediff + " => " + nscorediff + " )";
            console.log(shouldswitchsentence);
            
            // Check if player switch wouldnt unbalance the other way around, or result in the same score
            if (nscorediff >= scorediff) {
                // TODO : get second best player of strongest team
                console.log("a switch would make it unbalanced the other way around");
                shouldswitchsentence = '';
            }
            
        } else if (tbluescore < tredscore) {
            scorediff = (tredscore - tbluescore);
            console.log("Red stronger, score diff : " + scorediff);

            shouldswitch = findClosest(tredscoresarray,scorediff);

            ntredscore = (tredscore - tredscoresarray[shouldswitch]);
            ntbluescore = (tbluescore + tredscoresarray[shouldswitch]);
            
            
            if (ntbluescore > ntredscore) {
                nscorediff = (ntbluescore - ntredscore);
            } else if (ntbluescore < ntredscore) {
                nscorediff = (ntredscore - ntbluescore);
            }
            
            shouldswitchsentence = "Should switch to Blue : " + tredparray[shouldswitch] + " (Red => " +  ntredscore + ", Blue => " + ntbluescore + " scorediff : " + scorediff + " => " + nscorediff + " )";
            console.log(shouldswitchsentence);
            
            
            // Check if player switch wouldnt unbalance the other way around, or result in the same score
            if (nscorediff >= scorediff) {
                // TODO : get second best player of strongest team
                console.log("a switch would make it unbalanced the other way around");
                shouldswitchsentence = '';
            }
            
        }
        else {
            scorediff = 0;
        }
        
        // Update GUI : Player List, Team Scores, and Advice
        
        $("#mvprankplayerlist").html('');
        $.each(sortedarr, function( index, value ) {
            $("#mvprankplayerlist").append("<li class='item'><div class='name'><div class='position'>" + (index + 1) + ".</div> <div class='player " + value.pteam + "'> " + value.plyrname + "</div></div><div class='captures'>&nbsp;</div><div class='kd' style='width:13%; display: inline-block;'>" + value.pkd + "</div><div class='kd' style='width:13%; display: inline-block;'>" + value.pcd + "</div><div style='float:right;padding-right: 2em;'>" + value.pscore + "</div></li>");
        });
        $("#teamscores").html('');
        $("#teamscores").html("<div style='color: #4d7fd5;display: inline-block; width:33%;'>&nbsp;" + tbluescore + "</div>" + "<div style='text-align:center;width: 33%;display: inline-block;'>" + scorediff + "</div><div style='color:#dc4f46; display: inline-block;float: right; text-align: right; width:33%;'>" + tredscore + '&nbsp;</div>');
        $("#advice").html('');
        $("#advice").html(shouldswitchsentence);
        
        
        // Prepare data for the Chart
        
        highesttredscore = 0;
        highesttbluescore = 0;
        lowesttredscore = 0;
        lowesttbluescore = 0;
        data.tredscorelogitem = '';
        data.tbluescorelogitem = '';
        
        data.tredscorelogitem = Math.floor(tredscore/tredcount);
        data.tbluescorelogitem = Math.floor(tbluescore/tbluecount);
        tredscorelog.push(data.tredscorelogitem);
        tbluescorelog.push(data.tbluescorelogitem);
        
        
        
        tredscorelogcalcs = tredscorelog.slice(0);
        tbluescorelogcalcs = tbluescorelog.slice(0);
        
        highesttredscore = tredscorelogcalcs.sort(function(obj1, obj2) {
            // Ascending:
            return obj1 - obj2;
        }).reverse();
        
        highesttredscore = highesttredscore[0];
        
        highesttbluescore = tbluescorelogcalcs.sort(function(obj1, obj2) {
            // Ascending:
            return obj1 - obj2;
        }).reverse();
        
        highesttbluescore = highesttbluescore[0];
        
        lowesttredscore = tredscorelogcalcs.sort(function(obj1, obj2) {
            // Ascending:
            return obj1 - obj2;
        });
        
        lowesttredscore = lowesttredscore[0];
        
        lowesttbluescore = tbluescorelogcalcs.sort(function(obj1, obj2) {
            // Ascending:
            return obj1 - obj2;
        });
        
        lowesttbluescore = lowesttbluescore[0];
        
        if (highesttredscore > highesttbluescore){
            highesttscore = Math.floor(highesttredscore);
        } else {
            highesttscore = Math.floor(highesttbluescore);
        }
        
        if (lowesttredscore < lowesttbluescore){
            lowesttscore = Math.floor(lowesttredscore);
        } else {
            lowesttscore = Math.floor(lowesttbluescore);
        }
        
        chartstep = Math.floor((highesttscore + Math.abs(lowesttscore)) / 20);
        lowesttscore = lowesttscore - chartstep;
        highesttscore = highesttscore + chartstep;
        
        
        console.log("calc highesttscore : " + highesttscore + " calc lowesttscore : " + lowesttscore + " chartstep : " + chartstep);
        
        ctscorelogarray.push(ctscorelog);
        
        // TODO : push new data instead of replacing the chart every time
        $('.chart-container').remove();
        chartstats(ctscorelogarray,tredscorelog,tbluescorelog, highesttscore, lowesttscore, chartstep);
        
        ctscorelog = ctscorelog + 1;
    };
    
    /* CHART */
    
    function chartstats (ctscorelogarray,tredscorelog,tbluescorelog,highesttscore, lowesttscore, chartstep){
        console.log("chart red: " + tredscorelog + " & blue: " + tbluescorelog);
        window.chartColors = {
            red: 'rgba(248, 21, 69, 0.7)',
            orange: 'rgb(255, 159, 64)',
            yellow: 'rgb(255, 205, 86)',
            green: 'rgb(75, 192, 192)',
            blue: 'rgba(54, 162, 235, 0.7)',
            purple: 'rgb(153, 102, 255)',
            grey: 'rgb(201, 203, 207)'
        };
        function createConfig(gridlines, title) {
            console.log("highesttscore : " + highesttscore + " lowesttscore : " + lowesttscore + " chartstep : " + chartstep);
			return {
				type: 'line',
				data: {
					labels: ctscorelogarray,
					datasets: [{
						label: 'Red',
						backgroundColor: window.chartColors.red,
						borderColor: window.chartColors.red,
						data: tredscorelog,
						fill: false,
					}, {
						label: 'Blue',
						fill: false,
						backgroundColor: window.chartColors.blue,
						borderColor: window.chartColors.blue,
						data: tbluescorelog,
					}]
				},
				options: {
					responsive: true,
					title: {
						display: true,
						text: title
					},
					scales: {
						xAxes: [{
							gridLines: gridlines
						}],
						yAxes: [{
							gridLines: gridlines,
							ticks: {
								min: lowesttscore,
								max: highesttscore,
								stepSize: chartstep
							}
						}]
					}
				}
			};
		}
        
        
        
        
        var container = document.querySelector('#mvprankcontainer');

			[{
				title: 'Mean Player Score',
				gridLines: {
					display: true
				}
			}].forEach(function(details) {
				var div = document.createElement('div');
				div.classList.add('chart-container');

				var canvas = document.createElement('canvas');
				div.appendChild(canvas);
				container.appendChild(div);

				var ctx = canvas.getContext('2d');
				var config = createConfig(details.gridLines, details.title);
				new Chart(ctx, config);
			});
		};

    
    
    
    SWAM.on ( 'gamePrep', function (){
        
        //$("#mvprankcontainer").css({display: "none"});
    });
    
    // TODO : have a setting to auto update and if true, hook to detailedScoreUpdate event

    function onMatchStarted () {
        // empty arrays 
        tredscorelog = [];
        tbluescorelog = [];
        tredscorelogcalcs = [];
        tbluescorelogcalcs = [];
        ctscorelogarray = [];
        ctscorelog = 0;
        // TODO :
        // calcmvp
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