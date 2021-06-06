const DButils = require("./DButils");
// const TEAM_ID = "85";

function getDateAndTime(){
    //get today time
    let today = new Date();
    let time = today.getHours()+':'+today.getMinutes();
    return time;
}

async function getGamesInfo(games_ids_list) {
    let promises = [];
    games_ids_list.map((id) =>
    promises.push(getGameQueryById(id)) //get the query from the DB
    );
    let games_info = await Promise.all(promises);
    if (games_info.length==0)  //if there are no favorite games send an error
      throw { status: 409, message: "No favorite Games" };
    return extractRelevantGamesData(games_info); //return the info of each fav game
}

async function getGameQueryById(id){
    //get from the DB info about game that match the game id 
    const game_ids = await DButils.execQuery(
        `SELECT * FROM dbo.Games WHERE game_id='${id}'`
    );
    return game_ids;
}

function extractRelevantGamesData(games_info) {
    //if the list of games is bigger than 1 we need to sort it first
    if(games_info.length>1){
        games_info.sort((a,b)=>{ //sorting based of the date and time
            let temp_datea = String(a[0].gamedate).split('-');
            let temp_dateb = String(b[0].gamedate).split('-');
            let temp_timea = String(a[0].gametime).replace(":","");
            let temp_timeb = String(b[0].gametime).replace(":","")
            if (parseInt(temp_datea[0],10)>parseInt(temp_dateb[0],10)){
                return 1;
            }
            else if(parseInt(temp_datea[0],10)<parseInt(temp_dateb[0],10)){
                return -1;
            }
            else{
                if (parseInt(temp_datea[1],10)>parseInt(temp_dateb[1],10)){
                    return 1;
                }
                else if(parseInt(temp_datea[1],10)<parseInt(temp_dateb[1],10)){
                    return -1;
                }
                else{
                    if (parseInt(temp_datea[2],10)>parseInt(temp_dateb[2],10)){
                        return 1;
                    }
                    else if(parseInt(temp_datea[2],10)<parseInt(temp_dateb[2],10)){
                        return -1;
                    }
                    else{
                        if (parseInt(temp_timea,10)>parseInt(temp_timeb,10)){
                            return 1;
                        }
                        else if(parseInt(temp_timea,10)<parseInt(temp_timeb,10)){
                            return -1;
                        }
                        else{
                            return 0;
                        }
                    }
                }
            }
        });
    }
    games_info=games_info.slice(0,3); //need only 3 games
    //return the info of each fav game
    return games_info.map((games_info) => {
        const { gamedate, gametime, hometeam, awayteam, court } = games_info[0];
        return {
            game_date: gamedate,
            game_time: gametime,
            hometeam: hometeam,
            awayteam: awayteam,
            court: court,
          };
      });
    }
    async function getNewGamesByTeamName(team_name){
        const time = getDateAndTime(); //today time
        const games_info = await DButils.execQuery( //get from the DB new games of the team
            `SELECT * FROM dbo.Games WHERE (CAST(gamedate AS Date)>CAST(GETDATE() AS Date) OR (CAST(gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, gametime)>=CONVERT(TIME,'${time}'))) AND (hometeam='${team_name}' OR awayteam='${team_name}')`
        );
        //return their info
        return getNewGamesInfo(games_info);
    }

    async function getNewGames(){
        const time = getDateAndTime(); //today time
        //search in the db from games that is date and time didn't passed
        const games_info = await DButils.execQuery(
            `SELECT * FROM dbo.Games WHERE (CAST(gamedate AS Date)>CAST(GETDATE() AS Date) OR (CAST(gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, gametime)>=CONVERT(TIME,'${time}')))`
        );
        //retrun their info
        return getNewGamesInfo(games_info);
    }

    async function getNewGamesInfo(games_info) {
        //return info about games that didn't happend yet
        return games_info.map((games_info) => {
            const { gamedate, gametime, hometeam, awayteam, court } = games_info;
            return {
                game_date: gamedate,
                game_time: gametime,
                hometeam: hometeam,
                awayteam: awayteam,
                court: court,
              };
          });
      }
      
    async function getOldGamesByTeamName(team_name){
        const time = getDateAndTime(); //today time
        const games_info = await DButils.execQuery( //get from the DB old games of the team
            `SELECT dbo.Games.*, gamemin, eventdes FROM dbo.Games LEFT JOIN dbo.Logevent ON dbo.Games.game_id=dbo.Logevent.game_id WHERE (CAST(Games.gamedate AS DATE)<CAST(GETDATE() AS DATE) OR (CAST(Games.gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, Games.gametime)<CONVERT(TIME,'${time}'))) AND (hometeam='${team_name}' OR awayteam='${team_name}') ORDER BY game_id`
        );
        //return their info
        return getOldGamesInfo(games_info);
    }

    async function getOldGames(){
        const time = getDateAndTime(); //today time
        //search in the db from games that is date and time already passed
        const games_info = await DButils.execQuery(
            `SELECT dbo.Games.*,dbo.Logevent.gamedate AS gamedate2, dbo.Logevent.gametime AS gametime2, gamemin, eventdes  FROM dbo.Games, dbo.Logevent WHERE (dbo.Games.game_id=dbo.Logevent.game_id) AND  (CAST(Games.gamedate AS Date)<CAST(GETDATE() AS Date) OR (CAST(Games.gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, Games.gametime)<CONVERT(TIME,'${time}'))) ORDER BY game_id`
        );
        //retrun their info
        return getOldGamesInfo(games_info);
    }

    async function getOldGamesInfo(games_info) {
        //combine the events for each game
        let i=0;
        let j=i+1;
        while (j<games_info.length){ 
            j=i+1;
            games_info[i].fullinfo=[{ //create for each game fullinfo = array of events
                gamemin:games_info[i].gamemin,
                event:games_info[i].eventdes,
            }]
            while(j<games_info.length){ //go over the list and check if there are more evnets for this game
                if (games_info[i].game_id==games_info[j].game_id){
                    games_info[i].fullinfo.push({ //if so push them to the array
                        gamemin:games_info[j].gamemin,
                        event:games_info[j].eventdes,
                    })
                    games_info.splice(j,1); //remove the row we combine
                }
                else{
                    //check if there are no events for this game
                    if (games_info[i].fullinfo[0].gamemin==null || games_info[i].fullinfo[0].eventdes==null){
                        games_info[i].fullinfo=null;
                    }
                    i=i+1;
                    break;
                }
            }
        }
        //return info about games that already happend with the logevent
        return games_info.map((games_info) => {
            const { gamedate, gametime, hometeam, awayteam, court, score, fullinfo } = games_info;
            return {
                game_date: gamedate,
                game_time: gametime,
                hometeam: hometeam,
                awayteam: awayteam,
                court: court,
                score: score,
                logevent: fullinfo
              };
          });
      }


exports.getGamesInfo = getGamesInfo;
exports.getNewGames = getNewGames;
exports.getOldGames = getOldGames;
exports.getNewGamesByTeamName = getNewGamesByTeamName;
exports.getOldGamesByTeamName = getOldGamesByTeamName;
exports.getDateAndTime = getDateAndTime;