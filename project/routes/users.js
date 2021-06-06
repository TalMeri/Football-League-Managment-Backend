var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const games_utils = require("./utils/games_utils");
const team_utils = require("./utils/team_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM dbo.Users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/favoritePlayers", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const player_id = req.body.playerId;
    //get list of the user favorite players
    const players = await DButils.execQuery(
      "SELECT player_id FROM dbo.FavoritePlayers"
    );
    if (players.find((x) => x.player_id=== player_id)) //check if the player is already marked as favorite
      throw { status: 409, message: "Player already favorite" };
    await users_utils.markPlayerAsFavorite(user_id, player_id); //mark the player
    res.status(201).send("The player successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites players that were saved by the logged-in user
 */
router.get("/favoritePlayers", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const player_ids = await users_utils.getFavoritePlayers(user_id);
    let player_ids_array = [];
    player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
    const results = await players_utils.getPlayersInfo(player_ids_array); //get the info of each fav player
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path gets body with gameId and save this player in the favorites list of the logged-in user
 */
router.post("/favoriteGames", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const game_id = req.body.gameId;
    //get list of the user favorite gamess
    const games = await DButils.execQuery(
      "SELECT game_id FROM dbo.FavoriteGames"
    );
    if (games.find((x) => x.game_id=== game_id)) //check if the game is already marked as favorite
      throw { status: 409, message: "Game already favorite" };
    const game_with_id = await DButils.execQuery(
      `SELECT * FROM dbo.games WHERE game_id='${game_id}'`
    );
    if (game_with_id[0]==null) //check if the game is a valid game that exist
      throw { status: 409, message: "Game dosent exist" };
    const time = games_utils.getDateAndTime();
    const game_with_date = await DButils.execQuery(
      `SELECT * FROM dbo.games WHERE (CAST(gamedate AS Date)>CAST(GETDATE() AS Date) OR (CAST(gamedate AS Date)=CAST(GETDATE() AS Date) AND CONVERT(TIME, gametime)>=CONVERT(TIME,'${time}'))) AND game_id='${game_id}'`
    );
    if (game_with_date[0]==null) //check if the game is valid game that didn't happend yet
      throw { status: 409, message: "Game already happened" };
    await users_utils.markGameAsFavorite(user_id, game_id); //mark the player
    res.status(201).send("The game successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites games that were saved by the logged-in user
 */
router.get("/favoriteGames", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    await users_utils.clearOldGamesInDB(user_id); //remove from the DB games that already happend
    const game_ids = await users_utils.getFavoriteGames(user_id);
    let game_ids_array = [];
    game_ids.map((element) => game_ids_array.push(element.game_id)); //extracting the games ids into array
    const results = await games_utils.getGamesInfo(game_ids_array); //get the info of each fav game
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path gets body with teamId and save this player in the favorites list of the logged-in user
 */
 router.post("/favoriteTeams", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const team_id = req.body.teamId;
    //get list of the user favorite teams
    const teams = await DButils.execQuery(
      "SELECT team_id FROM dbo.FavoriteTeams"
    );
    if (teams.find((x) => x.team_id=== team_id)) //check if the team is already marked as favorite
      throw { status: 409, message: "Team already favorite" };
    await users_utils.markTeamAsFavorite(user_id, team_id); //mark the team
    res.status(201).send("The team successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites teams that were saved by the logged-in user
 */
router.get("/favoriteTeams", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const team_id = await users_utils.getFavoriteTeams(user_id);
    let teams_ids_array = [];
    team_id.map((element) => teams_ids_array.push(element.team_id)); //extracting the teams ids into array
    const results = await team_utils.getTeamsInfo(teams_ids_array); //get the info of each fav team
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
