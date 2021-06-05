var express = require("express");
var router = express.Router();
const players_utils = require("./utils/players_utils");

router.get("/playerPage/:playerId", async (req, res, next) => {
  try {
    const player_id = req.params.playerId;
    const player_details = await players_utils.getPlayerDetails(player_id);
    res.send(player_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;