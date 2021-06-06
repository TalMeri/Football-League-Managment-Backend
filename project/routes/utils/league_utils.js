const axios = require("axios");
const { decodeBase64 } = require("bcryptjs");
const DButils = require("./DButils");
const games_utils = require("./games_utils");
const LEAGUE_ID = 271;

async function getLeagueDetails() {
  //get from the API the info about league 271
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  const time = games_utils.getDateAndTime(); //today time
  //get from the db the next game for the league
  const next_game = await DButils.execQuery(
    `SELECT * FROM dbo.Games WHERE (CAST(gamedate AS Date)>CAST(GETDATE() AS Date) OR (CAST(gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, gametime)>=CONVERT(TIME,'${time}'))) ORDER BY gamedate,gametime`
  );
  if (league.data.data.current_stage_id!=null){
    const stage = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
      {
        params: {
          api_token: process.env.api_token,
        },
      }
    );
    return {
      league_name: league.data.data.name,
      current_season_name: league.data.data.season.data.name,
      current_stage_name: stage.data.data.name,
      next_game:{ //use the first game that come from the search
        game_date: next_game[0].gamedate,
        game_time: next_game[0].gametime,
        hometeam: next_game[0].hometeam,
        awayteam: next_game[0].awayteam,
        feild: next_game[0].feild,
        referee: next_game[0].referee
      }
    };
  }
  else{ //if the stage is over
    const stage = await axios.get(   
      `https://soccer.sportmonks.com/api/v2.0/stages/season/18334`,
      {
        params: {
          api_token: process.env.api_token,
        },
      }
    );
    return {
      league_name: league.data.data.name,
      current_season_name: league.data.data.season.data.name,
      current_stage_name: stage.data.data[0].name,
      next_game:{ //use the first game that come from the search
        game_date: next_game[0].gamedate,
        game_time: next_game[0].gametime,
        hometeam: next_game[0].hometeam,
        awayteam: next_game[0].awayteam,
        feild: next_game[0].feild,
        referee: next_game[0].referee
      }
    };
  }
}
exports.getLeagueDetails = getLeagueDetails;
