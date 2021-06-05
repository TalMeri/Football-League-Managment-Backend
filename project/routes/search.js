var express = require("express");
var router = express.Router();
const search_utils = require("./utils/search_utils");

router.get("/searchByName/:name", async (req, res, next) => {
    let playersAndTeams = [];
    try {
        playersAndTeams = await search_utils.searchByName(
        req.params.name
      );
      if (playersAndTeams.length==0){
        throw {status:409, message:"Result not found"}
      }
      else{
        res.send(playersAndTeams);
      }
    } catch (error) {
      next(error);
    }
  });

router.get("/filterWithPosition/:name/:position", async (req, res, next) => {
  try {
      const players = await search_utils.filterWithPosition(
      req.params.name,
      req.params.position
    );
    if (players.length==0){
      throw {status:409, message:"Result not found"}
    }
    else{
      res.send(players);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/filterWithTeamName/:name/:team_name", async (req, res, next) => {
  try {
      const players = await search_utils.filterWithTeamName(
      req.params.name,
      req.params.team_name
    );
    if (players.length==0){
      throw {status:409, message:"Result not found"}
    }
    else{
      res.send(players);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/filterWithPositionAndTeamName/:name/:position/:team_name", async (req, res, next) => {
  try {
      const players = await search_utils.filterWithPositionAndTeamName(
      req.params.name,
      req.params.position,
      req.params.team_name
    );
    if (playersAndTeams.length==0){
      throw {status:409, message:"Result not found"}
    }
    else{
      res.send(playersAndTeams);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;