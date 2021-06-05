const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
// const TEAM_ID = "85";

async function getPlayerIdsByTeam(team_id) {
  let player_ids_list = [];
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  });
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}

async function getPlayersInfo(players_ids_list) {
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      axios.get(`${api_domain}/players/${id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  if (players_info.length==0)
    throw { status: 409, message: "No favorite Players" };
  return extractRelevantPlayerData(players_info);
}

function extractRelevantPlayerData(players_info) {
  return players_info.map((player_info) => {
    const { fullname, image_path, position_id } = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}

async function getPlayersByTeam(team_id) {
  let player_ids_list = await getPlayerIdsByTeam(team_id);
  let playrs_info = await getPlayersInfo(player_ids_list);
  return playrs_info;
}

async function getPlayerDetails(player_id) {
  let promise = axios.get(`${api_domain}/players/${player_id}`, {
    params: {
      api_token: process.env.api_token,
      include: "team",
      },
    })
    let player_info = await promise;
    const { fullname, image_path, position_id, common_name, nationality, birthdate, birthcountry, height, weight } = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
      common_name: common_name,
      nationality: nationality,
      birthdate: birthdate,
      birthcountry: birthcountry,
      height: height,
      weight: weight,
    }
}

async function getPlayersDetailsByName(name) {
  const players = await axios.get(`${api_domain}/players/search/${name}`, {
    params: {
      api_token: process.env.api_token,
      include: ("team.league", "position")
    },
  })
  let players_league=[];
  players.data.data.map((player)=>{
    if(player.data.data.team!=null && player.data.data.team.data.league.data==271)
      players_league.push(player)
  });
  return players_league;
}

async function getPlayersByName(name){
  const players_match_name = await getPlayersDetailsByName(name);
  return players_match_name.map((player) => {
    const { fullname, image_path, position_id } = player;
    let name = null;
    if (player.team != null){
      name = player.team.data.name;
    }
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}

async function getPlayersByNameAndPosition(name, position){
  const players_match_name = await getPlayersDetailsByName(name);
  let players = [];
  players_match_name.data.data.map((player) =>{
    if (player.position!=null && player.position.name.toLowerCase()==position.toLowerCase()){
      players.push(player);
    }
  });
  return players.map((player) => {
    const { fullname, image_path, position_id } = player;
    let name = null;
    if (player.team != null){
      name = player.team.data.name;
    }
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}

async function getPlayersByNameAndTeamName(name, team_name){
  const players_match_name = await getPlayersDetailsByName(name);
  let players = [];
  players_match_name.data.data.map((player) =>{
    if (player.team!=null && player.team.data.name.toLowerCase()==team_name.toLowerCase()){
      players.push(player);
    }
  });
  return players.map((player) => {
    const { fullname, image_path, position_id } = player;
    let name = null;
    if (player.team != null){
      name = player.team.data.name;
    }
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}

async function getPlayersByNameAndPositionAndTeamName(name, position,team_name){
  const players_match_name = await getPlayersDetailsByName(name);
  let players = [];
  players_match_name.data.data.map((player) =>{
    if (player.team!=null && player.position!=null && player.position.name.toLowerCase()==position.toLowerCase() && player.team.data.name.toLowerCase()==team_name.toLowerCase()){
      players.push(player);
    }
  });
  return players.map((player) => {
    const { fullname, image_path, position_id } = player;
    let name = null;
    if (player.team != null){
      name = player.team.data.name;
    }
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getPlayerDetails = getPlayerDetails;
exports.getPlayersByName = getPlayersByName;
exports.getPlayersByNameAndPosition = getPlayersByNameAndPosition;
exports.getPlayersByNameAndPositionAndTeamName = getPlayersByNameAndPositionAndTeamName;
