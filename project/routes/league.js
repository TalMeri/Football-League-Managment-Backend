var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");

/**
 * This path returns details about the league 271
 */
router.get("/getDetails", async (req, res, next) => {
  try {
    //get details about the league
    const league_details = await league_utils.getLeagueDetails();
    res.send(league_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
