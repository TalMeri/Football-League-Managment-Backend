const DButils = require("./DButils");
const games_utils = require("./games_utils");

async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into dbo.FavoritePlayers values ('${user_id}',${player_id})`
  );
}

async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from dbo.FavoritePlayers where user_id='${user_id}'`
  );
  return player_ids;
}

async function markGameAsFavorite(user_id, game_id) {
  await DButils.execQuery(
    `insert into dbo.FavoriteGames values ('${user_id}',${game_id})`
  );
}

async function getFavoriteGames(user_id) {
  const game_ids = await DButils.execQuery(
    `select game_id from dbo.FavoriteGames where user_id='${user_id}'`
  );
  return game_ids;
}

async function markTeamAsFavorite(user_id, team_id) {
  await DButils.execQuery(
    `insert into dbo.FavoriteTeams values ('${user_id}',${team_id})`
  );
}

async function getFavoriteTeams(user_id) {
  const team_ids = await DButils.execQuery(
    `select team_id from dbo.FavoriteTeams where user_id='${user_id}'`
  );
  return team_ids;
}

async function clearOldGamesInDB(user_id){
  const time = games_utils.getDateAndTime();
  const games_id = await DButils.execQuery(
    `DELETE FROM dbo.FavoriteGames WHERE dbo.FavoriteGames.game_id IN (SELECT dbo.Games.game_id FROM dbo.Games, dbo.FavoriteGames WHERE Games.game_id=FavoriteGames.game_id AND (CAST(gamedate AS Date)<CAST(GETDATE() AS Date) OR (CAST(gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, gametime)<CONVERT(TIME,'${time}'))) AND user_id='${user_id}')`
  );
}


exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
exports.markGameAsFavorite=markGameAsFavorite;
exports.getFavoriteGames=getFavoriteGames;
exports.markTeamAsFavorite = markTeamAsFavorite;
exports.getFavoriteTeams = getFavoriteTeams;
exports.clearOldGamesInDB = clearOldGamesInDB;