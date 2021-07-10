var express = require("express");
var router = express.Router();
const games_utils = require("./utils/games_utils");
const team_utils = require("./utils/team_utils");
const DButils = require("./utils/DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

/**
 * This path returns all the games that didn't happend yet
 */
router.get("/getAllNewGames", async (req, res, next) => {
  try {
    //get details about games that didn't happend yet
    const games_details = await games_utils.getNewGames();
    res.send(games_details);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns all the game that already happend
 */
router.get("/getAllOldGames", async (req, res, next) => {
    try {
      //get details about games that already happend
      const games_details = await games_utils.getOldGames();
      res.send(games_details);
    } catch (error) {
      next(error);
    }
  });

// router.get("/getAllTeamsName", async (req, res, next) => {
//   try {
//     const teams = await team_utils.getAllTeams();
//     res.send(teams);
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/Referee", async (req, res, next) => {
  try {
    //return all the referee
    const Referees = await DButils.execQuery(
      "SELECT name FROM dbo.Referees"
    );
    res.send(Referees);
  } catch (error) {
    next(error);
  }
});

/**
 * This path gets body with details for game and save this gmae in the system
 */
router.post("/addGame", async (req, res, next) => {
  try {
    //add new game to the DB
    const user_id = req.session.user_id;
    if (user_id!=2) //check if the user is the representative
      throw { status: 401, message: "Only Representative of the Association can add games" };

    //check the referee
    const referee = await DButils.execQuery(
      "SELECT name FROM dbo.Referees"
    );
    if (!(referee.find((x) => x.name.toLowerCase()=== req.body.referee.toLowerCase())))
      throw { status: 409, message: "Referee is not found" };

    //check the date
    const dateElem=String(req.body.game_date).split('-');
    if (dateElem.length!=3 || dateElem[0].length!=4 || dateElem[1].length!=2 || dateElem[2].length!=2 || isNaN(dateElem[0]) || isNaN(dateElem[1]) || isNaN(dateElem[2]) || parseInt(dateElem[0],10)<2021 ||parseInt(dateElem[1],10)<0 ||parseInt(dateElem[1],10)>12|| parseInt(dateElem[2],10)<0 || parseInt(dateElem[2],10)>31)
      throw {status:409, message:"wrong format for date"}
    if( dateElem[0]>2022)
    throw {status:409, message:"Date is not in the season"}
    let today = new Date();
    const timeElem=String(req.body.game_time).split(':');
    let time = games_utils.getDateAndTime();
    time=time.replace(':','');
    if (parseInt(dateElem[0],10)<today.getFullYear() || (parseInt(dateElem[0],10)==today.getFullYear() && (parseInt(dateElem[1],10)<today.getMonth()+1 || (parseInt(dateElem[1],10)==today.getMonth()+1 && (parseInt(dateElem[2],10)<today.getDate()|| (parseInt(dateElem[2],10)==today.getDate() && parseInt(timeElem[0]+timeElem[1],10)<parseInt(time,10)))))))
      throw {status:409, message:"The date is passed"}

    //check the time
    if (timeElem.length!=2 || timeElem[0].length!=2 || timeElem[1].length!=2  || isNaN(timeElem[0]) || isNaN(timeElem[1]) || parseInt(timeElem[0],10)<0 ||parseInt(timeElem[0],10)>24 ||parseInt(timeElem[1],10)<0|| parseInt(timeElem[1],10)>59)
      throw {status:409, message:"wrong format for time"}
    
    //check the feild
    const feild = await DButils.execQuery(
      "SELECT name FROM dbo.Feilds"
    );
    if (!(feild.find((x) => x.name.toLowerCase() === req.body.feild.toLowerCase())))
      throw { status: 409, message: "Feild is not found" };

    //check the teams
    const hometeam = req.body.hometeam;
    const hometeams = await axios.get(`${api_domain}/teams/search/${hometeam}`, {
      params: {
        api_token: process.env.api_token,
        include: "league"
      },
    });
    if (hometeams.data.data.length==0)
      throw { status: 409, message: "There is no such team" };
    if (hometeams.data.data.leauge!=null && hometeams.data.data.leauge.data.id!=271)
      throw { status: 409, message: "Team is not in the league" };
    const hometeamId = hometeams.data.data.id
    const awayteam = req.body.awayteam;
    const awayteams = await axios.get(`${api_domain}/teams/search/${awayteam}`, {
      params: {
        api_token: process.env.api_token,
        include: "league"
      },
    });
    if (awayteams.data.data.length==0)
      throw { status: 409, message: "There is no such team" };
    if (awayteams.data.data.leauge!=null && awayteams.data.data.leauge.data.id!=271)
      throw { status: 409, message: "Team is not in the league" };
      const awayteamId = awayteams.data.data.id

    // check if valid game
    const allGames = await DButils.execQuery(
      `SELECT * FROM dbo.Games WHERE gamedate='${req.body.game_date}' AND gametime='${req.body.game_time}'`
    );
    if (allGames.find((x) => x.feild === req.body.feild))
      throw { status: 409, message: "The feild is occupied at this time" };
    if (allGames.find((x) => x.hometeam === req.body.hometeam || x.awayteam === req.body.awayteam))
      throw { status: 409, message: "The team is occupied at this time" };
      
    // add the new game
    await DButils.execQuery(
      `INSERT INTO dbo.Games (gamedate, gametime, hometeam, awayteam, feild, referee) VALUES ('${req.body.game_date}','${req.body.game_time}','${req.body.hometeam}',${hometeamId},'${req.body.awayteam}',${awayteamId},'${req.body.feild}','${req.body.referee}')`
    );
    res.status(201).send("Game added");
  } catch (error) {
    next(error);
  }
});

module.exports = router;