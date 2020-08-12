const fs=require('fs');
var csvList;
var tournaments;
const dubQuote="\"\"";
const seriesName=fs.readFileSync("name.txt", "utf8").toString();
var jsonObj;
var toJson="{\"tournaments\":{";
var players;
var thesePlay;
var currrentPlay;
csvList=fs.readdirSync("./",{ withFileTypes: true }); 
console.log(seriesName);
	var i=0;
	tournaments=[csvList.length];
	players=[csvList.length];
	
	for(i=0;i<csvList.length;i++){
		if(csvList[i].name.substring(csvList[i].name.length-4)===".csv"){
			process(csvList[i].name,i);
		}
	}
	parse();
function process(fileIn,num){
	tournaments[num]=fs.readFileSync(fileIn).toString().split("\n");
	var l=0;
	for(l=0;l<tournaments[num].length;l++){
		tournaments[num][l]=tournaments[num][l].split(",");
	}
}
function parse(){
	var j=0;
	var k=1;
	var eventName;
	for(j=0;j<tournaments.length;j++){
		eventName=seriesName;
		eventName+="-"+(j+1);
		toJson+="\""+eventName+"\":{"
		players[j]="\"players\":{";
		for(k=1;k<tournaments[j].length;k++){
			if(tournaments[j][k][11]!=undefined){
				players[j]+="\"";
				players[j]+=tournaments[j][k][11];
				players[j]+="\":\""
				players[j]+=tournaments[j][k][6];
				players[j]+="\""
				if(k<tournaments[j].length-2){
					players[j]+=",";
				}
			}
		}
		players[j]+="}";
		toJson+=players[j];
		toJson+="}";
		if(j!=tournaments.length-1){
			toJson+=",";
		}
	}
	toJson+="}}";
	makeValid();
	jsonObj=JSON.parse(toJson);
	stats();
	writeFile();
}
function makeValid(){
	var count=0;
	for(count=0;count<toJson.length-1;count++){
		if(toJson.substring(count,count+2)==dubQuote){
			toJson=toJson.substring(0,count)+toJson.substring(count+1);
		}
	}
}
function writeFile(){
		var jsonName=seriesName+".json";
		toJson=JSON.stringify(jsonObj);
		fs.writeFile(jsonName, toJson, (err) => { 
		if (err) 
			console.log(err); 
		else { 
			console.log(jsonName+" written successfully"); 
		} 
	});
}
function stats(){
	thesePlay=JSON.stringify(jsonObj.tournaments[seriesName+"-1"].players);
	thesePlay=thesePlay.substring(1,thesePlay.length-1);
	thesePlay=thesePlay.split(",");
	var c=0;
	var d;
	var e;
	var f;
	for(c=0;c<thesePlay.length;c++){
		for(d=0;d<thesePlay[c].length;d++){
			if(thesePlay[c].charAt(d)==':'){
				thesePlay[c]=thesePlay[c].substring(0,d);
			}
		}
	}
	for(e=1;e<tournaments.length;e++){
		currentPlay=JSON.stringify(jsonObj.tournaments[seriesName+"-"+(e+1)].players);
		currentPlay=currentPlay.substring(1,currentPlay.length-1);
		currentPlay=currentPlay.split(",");
		for(c=0;c<currentPlay.length;c++){
			for(d=0;d<currentPlay[c].length;d++){
				if(currentPlay[c].charAt(d)==':'){
					currentPlay[c]=currentPlay[c].substring(0,d);
				}
			}
		}
		for(f=0;f<currentPlay.length;f++){
			addPlayers(f);
		}
	}
	var playerList="{\"players\":{";
	var h;
	var idk;
	var firstTourney;
	for(h=0;h<thesePlay.length;h++){
		firstTourney=true;
		playerList+=thesePlay[h]+":{\"placings\":{"
		for(idk=0;idk<tournaments.length;idk++){
			if(jsonObj.tournaments[(seriesName+"-"+(idk+1))].players[thesePlay[h].substring(1,thesePlay[h].length-1)]!=undefined){
				/*if(playerList.charAt(playerList.length-1)!='{'){
					playerList+="},";
				}*/
				if(firstTourney){
					firstTourney=false;
				}
				else{
					playerList+=",";
				}
				playerList+="\""+seriesName+"-"+(idk+1)+"\":"+jsonObj.tournaments[seriesName+"-"+(idk+1)].players[thesePlay[h].substring(1,thesePlay[h].length-1)];
			}
			//playerList+="}";
		}
		playerList+="}}";
		if(h<thesePlay.length-1){
			playerList+=",";
		}
	}
	playerList+="}}";
	var playerListJson=JSON.parse(playerList);
	var curPlayer;
	var totals;
	for(h=0;h<thesePlay.length;h++){
		totals=0;
		for(idk=0;idk<tournaments.length;idk++){
			if(playerListJson.players[thesePlay[h].substring(1,thesePlay[h].length-1)].placings[seriesName+"-"+(idk+1)]!=undefined){
				totals+=parseInt(playerListJson.players[thesePlay[h].substring(1,thesePlay[h].length-1)].placings[seriesName+"-"+(idk+1)]);
			}
		}
		totals/=Object.keys(playerListJson["players"][Object.keys(playerListJson.players)[h]].placings).length;
		playerListJson.players[thesePlay[h].substring(1,thesePlay[h].length-1)]["average-placing"]=totals;
		jsonObj["players"]=playerListJson;
	}
}
function addPlayers(f){
	var g;
	for(g=0;g<thesePlay.length;g++){
		if(thesePlay[g]==currentPlay[f]){
			return;
		}
	}
	thesePlay.push(currentPlay[f]);
}