var express = require("express");
var router = express.Router();
const search_utils = require("./utils/search_utils");

/**
 * This path gets a name and returns all the team and players from the league that match the search
 */
router.get("/searchByName/:name", async (req, res, next) => {
  //get info about team and players that match the name
    let playersAndTeams = [];
    try {
        playersAndTeams = await search_utils.searchByName(
        req.params.name
      );
      if (playersAndTeams.length==0){ //error when there are no teams/players that match the search
        throw {status:409, message:"Result not found"}
      }
      else{
        res.send(playersAndTeams);
      }
    } catch (error) {
      next(error);
    }
  });

/**
 * This path gets a name and postion returns all the players from the league that match the search
 */
router.get("/filterWithPosition/:name/:position", async (req, res, next) => {
  //get info about players that match the name and the position
  try {
      const players = await search_utils.filterWithPosition(
      req.params.name,
      req.params.position
    );
    if (players.length==0){
      throw {status:409, message:"Result not found"} //error when there are no players that match the search
    }
    else{
      res.send(players);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * This path gets a name and team name returns all the players from the league that match the search
 */
router.get("/filterWithTeamName/:name/:team_name", async (req, res, next) => {
  //get info about players that match the name and the team name
  try {
      const players = await search_utils.filterWithTeamName(
      req.params.name,
      req.params.team_name
    );
    if (players.length==0){
      throw {status:409, message:"Result not found"} //error when there are no teams/players that match the search
    }
    else{
      res.send(players);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * This path gets a name, postion and team name returns all the players from the league that match the search
 */
router.get("/filterWithPositionAndTeamName/:name/:position/:team_name", async (req, res, next) => {
  //get info about players that match the name, the position and the team name
  try {
      const players = await search_utils.filterWithPositionAndTeamName(
      req.params.name,
      req.params.position,
      req.params.team_name
    );
    if (players.length==0){
      throw {status:409, message:"Result not found"} //error when there are no teams/players that match the search
    }
    else{
      res.send(players);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;