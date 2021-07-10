const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
// const TEAM_ID = "85";

async function getPlayerIdsByTeam(team_id) {
  //get from the API list of player in the team based on the team id
  let player_ids_list = []; 
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  }); 
  //add the the list the players id
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
          include: "team, position",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  if (players_info.length==0) //if there are no favorite players send an error
    throw { status: 409, message: "No favorite Players" };
  return extractRelevantPlayerData(players_info); //return the info of each fav player
}

function extractRelevantPlayerData(players_info) {
  //return the info of each fav player
  return players_info.map((player_info) => {
    const { player_id, fullname, image_path} = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    let position = null;
    if (player_info.data.data.position!=null)
      position = player_info.data.data.position.data.name;
    return {
      id: player_id,
      name: fullname,
      image: image_path,
      position: position,
      team_name: name,
    };
  });
}

async function getPlayersByTeam(team_id) {
  let player_ids_list = await getPlayerIdsByTeam(team_id); //get a list of player in the team
  let playrs_info = await getPlayersInfo(player_ids_list); //get info for all the players in the team
  return playrs_info;
}

async function getPlayerDetails(playerid) {
  //get from the API the info about this playerID
  let promise = axios.get(`${api_domain}/players/${playerid}`, {
    params: {
      api_token: process.env.api_token,
      include: "team, position",
      },
    })
    let player_info = await promise;
    const { player_id ,fullname, image_path, common_name, nationality, birthdate, birthcountry, height, weight } = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      id: player_id,
      name: fullname,
      image: image_path,
      position: player_info.data.data.position.data.name,
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
  //get from the API players that match the name 
  const players = await axios.get(`${api_domain}/players/search/${name}`, {
    params: {
      api_token: process.env.api_token,
      include: "team.league, position"
    },
  })
  let players_league=[];//will contain only player from the league
  players.data.data.map((player)=>{
    //check that the player is in the league
    if(player.team!=null && player.team.data.league!=null && player.team.data.league.data.id==271 && player.fullname.toLowerCase().includes(name.toLowerCase()))
      players_league.push(player)
  });
  return players_league;
}

async function getPlayersByName(name){
  //get details about the players that match the name
  const players_match_name = await getPlayersDetailsByName(name);
  return players_match_name.map((player) => {
    const { player_id, fullname, image_path } = player;
    let name = null; //if there is no team for the player
    if (player.team != null){
      name = player.team.data.name;
    }
    return {
      id: player_id,
      name: fullname,
      image: image_path,
      position: player.position.data.name,
      team_name: name,
    };
  });
}

async function getPlayersByNameAndPosition(name, position){
  //get players that match the name and from the league
  const players_match_name = await getPlayersDetailsByName(name);
  let players = []; //will contain only players that match the position 
  players_match_name.map((player) =>{
    //check that the position match 
    if (player.position!=null && player.position.data.name.toLowerCase()==position.toLowerCase()){
      players.push(player);
    }
  });
  return players.map((player) => {
    const { player_id, fullname, image_path } = player;
    let name = null;
    if (player.team != null){
      name = player.team.data.name;
    }
    return {
      id: player_id, 
      name: fullname,
      image: image_path,
      position: player.position.data.name,
      team_name: name,
    };
  });
}

async function getPlayersByNameAndTeamName(name, team_name){
   //get players that match the name and from the league
  const players_match_name = await getPlayersDetailsByName(name);
  let players = []; //will contain only player that match the team name
  players_match_name.map((player) =>{
    //check that the team name match
    if (player.team!=null && player.team.data.name.toLowerCase()==team_name.toLowerCase()){
      players.push(player);
    }
  });
  return players.map((player) => {
    const { player_id, fullname, image_path} = player;
    let name = null;
    if (player.team != null){
      name = player.team.data.name;
    }
    return {
      id: player_id,
      name: fullname,
      image: image_path,
      position: player.position.data.name,
      team_name: name,
    };
  });
}

async function getPlayersByNameAndPositionAndTeamName(name, position,team_name){
   //get players that match the name and from the league
  const players_match_name = await getPlayersDetailsByName(name);
  let players = []; //will conatin only players that match the position and the team name
  players_match_name.map((player) =>{
    //check that the team name and position match
    if (player.team!=null && player.position!=null && player.position.name.toLowerCase()==position.toLowerCase() && player.team.data.name.toLowerCase()==team_name.toLowerCase()){
      players.push(player);
    }
  });
  return players.map((player) => {
    const { player_id, fullname, image_path } = player;
    let name = null;
    if (player.team != null){
      name = player.team.data.name;
    }
    return {
      id: player_id,
      name: fullname,
      image: image_path,
      position: player.position.data.name,
      team_name: name,
    };
  });
}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getPlayerDetails = getPlayerDetails;
exports.getPlayersByName = getPlayersByName;
exports.getPlayersByNameAndPosition = getPlayersByNameAndPosition;
exports.getPlayersByNameAndTeamName = getPlayersByNameAndTeamName;
exports.getPlayersByNameAndPositionAndTeamName = getPlayersByNameAndPositionAndTeamName;
