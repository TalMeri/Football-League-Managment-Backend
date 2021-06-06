const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const players_utils = require("./players_utils");
const games_utils = require("./games_utils");

async function getTeamDetails(team_id) {
  //get from the API the info about this teamID
    let promise = await axios.get(`${api_domain}/teams/${team_id}`, {
      params: {
        api_token: process.env.api_token,
      },
    });
    let team_info = await promise;
    const { name, twitter, founded, logo_path } = team_info.data.data;
    return {
      name: name,
      twitter: twitter,
      founded: founded,
      logo_path: logo_path,
    }
  }

  async function getAllteamDetails(team_id) {
    //get the info of the team
    let team = await getTeamDetails(team_id);
    //get the info about the players in the team
    let players = await players_utils.getPlayersByTeam(team_id);
    if (players.length==0) //if there are no players
      players=null;
    //get the info about the new games of the team
    let newGames = await games_utils.getNewGamesByTeamName(team.name);
    if (newGames.length==0)//if there are no new games
      newGames=null;
    //get the info about the old games of the team 
    let oldGames = await games_utils.getOldGamesByTeamName(team.name);
    if (oldGames.length==0) //if there are no old games
      oldGames=null;
    return{
      team,
      players: players,
      new_games: newGames,
      old_games: oldGames
    }
  }

  async function getTeamsByName(name) {
    //get from the API teams that match the name 
    const teams = await axios.get(`${api_domain}/teams/search/${name}`, {
      params: {
        api_token: process.env.api_token,
        include: "league",
      },
    })
    let team_match_league = []; //will contain only teams in the league
    teams.data.data.map((team) => {
      //check if the team in the league
      if (team.league!=undefined && team.league.data.id==271){
        team_match_league.push(team);
      }
    });
    return team_match_league.map((team) => {
      const { name, logo_path } = team;
    return {
      name: name,
      logo_path: logo_path,
      };
    });
  }

  async function getTeamsInfo(teams_ids_list) {
    let promises = [];
    teams_ids_list.map((id) =>
      promises.push(
        axios.get(`${api_domain}/teams/${id}`, {
          params: {
            api_token: process.env.api_token,
          },
        })
      )
    );
    let teams_info = await Promise.all(promises);
    if (teams_info.length==0) //if there are no favorite teams send an error
      throw { status: 409, message: "No favorite Teams" };
    //return the info of each fav team
    return teams_info.map((teams_info) => {
      const { name, logo_path } = teams_info.data.data;
    return {
      name: name,
      logo_path: logo_path,
      };
    });
  }

  // async function getAllTeams() {
  //   const teams = await axios.get(`${api_domain}/teams`, {
  //     params: {
  //       api_token: process.env.api_token,
  //     },
  //   })
  //   return teams.data.data.map((team) => {
  //     const { name } = team;
  //   return {
  //     name: name,
  //     };
  //   });
  // }

  exports.getAllteamDetails=getAllteamDetails;
  exports.getTeamsByName = getTeamsByName;
  exports.getTeamsInfo = getTeamsInfo;
  exports.getAllTeams = getAllTeams;