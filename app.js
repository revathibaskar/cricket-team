const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null
const app = express()
app.use(express.json())

const initialDbandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initialDbandServer()

//API 1

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT * 
    FROM cricket_team;
  `
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//API 2

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayerQuery = `
   INSERT INTO 
      cricket_team (player_name,jersey_number,role)
   VALUES 
      (
        "${playerName}",
        ${jerseyNumber},
        "${role}" 
        );`

  const resp = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//API 3

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      cricket_team 
    WHERE 
       player_id = ${playerId};`

  const playerDetail = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(playerDetail))
})

//API 4

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerDetails = ` 
   UPDATE 
     cricket_team
   SET
     player_name = '${playerName}',
     jersey_number = ${jerseyNumber},
     role = '${role}' 
   WHERE 
     player_id = ${playerId};`

  const updatedPlayerDetail = await db.run(updatePlayerDetails)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = ` 
    DELETE FROM 
       cricket_team 
    WHERE 
       player_id = ${playerId};`

  const deletedDetail = await db.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
