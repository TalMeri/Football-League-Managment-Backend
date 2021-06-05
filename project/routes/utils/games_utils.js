const DButils = require("./DButils");
// const TEAM_ID = "85";

function getDateAndTime(){
    let today = new Date();
    let time = today.getHours()+':'+today.getMinutes();
    return time;
}

async function getGamesInfo(games_ids_list) {
    let promises = [];
    games_ids_list.map((id) =>
    promises.push(getGameQueryById(id))
    );
    let games_info = await Promise.all(promises);
    if (games_info.length==0)
      throw { status: 409, message: "No favorite Games" };
    return extractRelevantGamesData(games_info);
}

async function getGameQueryById(id){
    const game_ids = await DButils.execQuery(
        `SELECT * FROM dbo.Games WHERE game_id='${id}'`
    );
    return game_ids;
}

function extractRelevantGamesData(games_info) {
    if(games_info.length>1){
        games_info.sort((a,b)=>{
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
    games_info=games_info.slice(0,3);
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
        const time = getDateAndTime();
        const games_info = await DButils.execQuery(
            `SELECT * FROM dbo.Games WHERE (CAST(gamedate AS Date)>CAST(GETDATE() AS Date) OR (CAST(gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, gametime)>=CONVERT(TIME,'${time}'))) AND (hometeam='${team_name}' OR awayteam='${team_name}')`
        );
        return getNewGamesInfo(games_info);
    }

    async function getNewGames(){
        const time = getDateAndTime();
        const games_info = await DButils.execQuery(
            `SELECT * FROM dbo.Games WHERE (CAST(gamedate AS Date)>CAST(GETDATE() AS Date) OR (CAST(gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, gametime)>=CONVERT(TIME,'${time}')))`
        );
        return getNewGamesInfo(games_info);
    }

    async function getNewGamesInfo(games_info) {
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
        const time = getDateAndTime();
        const games_info = await DButils.execQuery(
            `SELECT dbo.Games.*, gamemin, eventdes FROM dbo.Games LEFT JOIN dbo.Logevent ON dbo.Games.game_id=dbo.Logevent.game_id WHERE (CAST(Games.gamedate AS DATE)<CAST(GETDATE() AS DATE) OR (CAST(Games.gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, Games.gametime)<CONVERT(TIME,'${time}'))) AND (hometeam='${team_name}' OR awayteam='${team_name}') ORDER BY game_id`
        );
        return getOldGamesInfo(games_info);
    }

    async function getOldGames(){
        const time = getDateAndTime();
        const games_info = await DButils.execQuery(
            `SELECT dbo.Games.*,dbo.Logevent.gamedate AS gamedate2, dbo.Logevent.gametime AS gametime2, gamemin, eventdes  FROM dbo.Games, dbo.Logevent WHERE (dbo.Games.game_id=dbo.Logevent.game_id) AND  (CAST(Games.gamedate AS Date)<CAST(GETDATE() AS Date) OR (CAST(Games.gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, Games.gametime)<CONVERT(TIME,'${time}'))) ORDER BY game_id`
        );
        return getOldGamesInfo(games_info);
    }

    async function getOldGamesInfo(games_info) {
        let i=0;
        let j=i+1;
        while (j<games_info.length){
            j=i+1;
            games_info[i].fullinfo=[{
                gamemin:games_info[i].gamemin,
                event:games_info[i].eventdes,
            }]
            while(j<games_info.length){
                if (games_info[i].game_id==games_info[j].game_id){
                    games_info[i].fullinfo.push({
                        gamemin:games_info[j].gamemin,
                        event:games_info[j].eventdes,
                    })
                    games_info.splice(j,1);
                }
                else{
                    if (games_info[i].fullinfo[0].gamemin==null || games_info[i].fullinfo[0].eventdes==null){
                        games_info[i].fullinfo=null;
                    }
                    i=i+1;
                    break;
                }
            }
        }
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