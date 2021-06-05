const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const players_utils = require("./players_utils");
const team_utils = require("./team_utils");

async function searchByName(name) {
  let players = await players_utils.getPlayersByName(name);
  if(players.length==0){
    players=null;
  }
  let teams = await team_utils.getTeamsByName(name);
  if(teams.length==0){
    teams=null;
  }
    return{
      players: players,
      teams: teams
    }
  }

async function filterWithPosition(name,position) {
  let players= await players_utils.getPlayersByNameAndPosition(name, position);
  if(players.length==0){
    players=null;
  }
    return players
  }

async function filterWithTeamName(name,team_name) {
  let players= await players_utils.getPlayersByNameAndPosition(name, team_name);
  if(players.length==0){
    players=null;
  }
    return players
  }

  async function filterWithPositionAndTeamName(name,position,team_name) {
    let players= await players_utils.getPlayersByNameAndPosition(name, position,team_name);
    if(players.length==0){
      players=null;
    }
      return players
    }

exports.searchByName = searchByName;
exports.filterWithPosition = filterWithPosition;
exports.filterWithTeamName = filterWithTeamName;
exports.filterWithPositionAndTeamName = filterWithPositionAndTeamName;