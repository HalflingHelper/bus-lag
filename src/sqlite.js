/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

// Utilities we need
const fs = require("fs");

// Initialize the database
const dbFile = "./.data/yay.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;


/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
async function loadInitData(db) {
  await db.run(
    "CREATE TABLE Challenges (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, reward TEXT, complete INTEGER DEFAULT 0, spent INTEGER DEFAULT 0)"
  )

  await db.run(
    `INSERT INTO Challenges (title, description, reward, complete) VALUES
            ('Make cheese', 'make some yummy cheese', 'bus', 1),
            ('Throw cheese', 'baseball is fun', 'scooter', 1),
            ('Buy cheese', 'buy some yummy cheese', 'uber', 1),
            ('Eat cheese', 'eat some yummy cheese', 'bus', 1),
            ('Sell cheese', 'Find a pedestrian and sell them cheese', 'bus', 0)
          `
  )

  await db.run(
    "CREATE TABLE Teams (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)"
  )

  await db.run(
    `INSERT INTO Teams (name) VALUES
          ('Reece & Calvin'),
          ('Ronak & Matei'),
          ('Flynn & Dane'),
          ('Addie & Mia')`
  )


  await db.run(
    "CREATE TABLE TeamTickets (id INTEGER PRIMARY KEY AUTOINCREMENT, team_id INTEGER, challenge_id INTEGER, old INTEGER DEFAULT 0, FOREIGN KEY (team_id) REFERENCES Teams(id), FOREIGN KEY (challenge_id) REFERENCES Challenges(id))"
  )

  await db.run(
    "CREATE TABLE Flop (id INTEGER PRIMARY KEY AUTOINCREMENT, challenge_id INTEGER, FOREIGN KEY (challenge_id) REFERENCES Challenges(id))"
  )

  // Initial Flop
  await db.run(
    "INSERT INTO Flop (challenge_id) VALUES (1), (2), (3), (4)"
  )

  await db.run(
    "CREATE TABLE Log (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, time STRING)"
  )
}


dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    // We use try and catch blocks throughout to handle any database errors
    try {
      // The async / await syntax lets us write the db operations in a way that won't block the app
      if (!exists) {
        await loadInitData(db);
      } else {
        // We have a database already - write Choices records to log for info
        // console.log(await db.all("SELECT * from Choices"));

        //If you need to remove a table from the database use this syntax
        //db.run("DROP TABLE Logs"); //will fail if the table doesn't exist
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });


// Our server script will call these methods to connect to the db
module.exports = {

  reshuffleChallenges: async () => {
    console.log("RESHUFFLE");


    let blah1 = await (db.all("SELECT * FROM Challenges"))
    console.log(blah1)

    await db.run(
      "UPDATE Challenges SET spent=0, complete=0 WHERE complete=2 AND spent=1"
    )

    let blah = await (db.all("SELECT * FROM Challenges"))
    console.log(blah)

    let flop_size = await db.all("SELECT COUNT(*) FROM Flop");

    flop_size = flop_size[0]['COUNT(*)']

    console.log(flop_size)

    if (flop_size < 4) {
      let new_cs = await db.all(`SELECT (id) FROM Challenges WHERE complete=0 ORDER BY RANDOM() LIMIT ?`, 4 - flop_size)

      console.log(new_cs)

      await new_cs.forEach(async (c) => {
        await db.run(
          "INSERT INTO Flop (challenge_id) VALUES (?)", c.id
        )

        await db.run(
          "UPDATE Challenges SET complete = 1 WHERE id = ?",
          c.id
        );
      })
    }
  },


  // TODO: Add logging (trivial)
  resetChallenges: async () => {
    console.log("RESET")

    await db.run("DROP TABLE Challenges")
    await db.run("DROP TABLE Teams")
    await db.run("DROP TABLE Flop")
    await db.run("DROP TABLE TeamTickets")
    await db.run("DROP TABLE Log")

    await loadInitData(db);
  },

  spendChallenge: async (challenge_id) => {
    try {
      await db.run(
        "UPDATE Challenges SET spent=1 WHERE id = ?",
        challenge_id
      )

      await db.run(
        "UPDATE TeamTickets SET old=1 WHERE challenge_id=?",
        challenge_id
      )
    } catch (dbError) {
      console.error(dbError);
    }
  },


  getTeams: async () => {
    try {
      let teams = await db.all(
        `SELECT Teams.id, Teams.name FROM Teams`
      )

      let challenges = await db.all(
        `SELECT TeamTickets.team_id, Challenges.id, Challenges.reward
        FROM TeamTickets 
          INNER JOIN Challenges on TeamTickets.challenge_id = Challenges.id
          WHERE (Challenges.complete=2 AND Challenges.spent=0 AND TeamTickets.old=0)`
      )

      if (teams && challenges) {
        // I want the team id in both the be the same
        teams = teams.map(t => { return { "id": t.id, "name": t.name, "challenges": challenges.filter(c => c.team_id == t.id) } })

        teams.forEach(t => {
          t.remaining = 3 - t.challenges.length
        });
      }

      return teams
    } catch (dbError) {
      console.error(dbError)
    }
  },

  getFlop: async () => {
    try {
      return await db.all("SELECT Flop.id, challenge_id, title, description, reward FROM Flop INNER JOIN Challenges on Flop.challenge_id=Challenges.id");

    } catch (dbError) {
      console.error(dbError);
    }
  },

  updateFlop: async (flop_id, dest) => {
    try {
      let challenge_id = await db.all(`SELECT (challenge_id) FROM Flop WHERE id=${flop_id}`)

      // console.log(challenge_id)

      await db.run(
        `DELETE FROM Flop WHERE id=${flop_id}`
      )


      if (challenge_id && challenge_id.length > 0) {

        if (dest > 0) {
          await db.run(
            "UPDATE Challenges SET complete = 2 WHERE id = ?",
            challenge_id[0].challenge_id
          );

          // TODO: Put the challenge somewhere else?
          await db.run(
            "INSERT INTO TeamTickets (team_id, challenge_id) VALUES (?, ?)",
            dest, challenge_id[0].challenge_id
          )
        }
        else {
          await db.run(
            "UPDATE Challenges SET complete = 2, spent=1 WHERE id = ?",
            challenge_id[0].challenge_id
          );
        }

      }


      // Mark the challenge as gone

      let new_c = await db.all(`SELECT (id) FROM Challenges WHERE complete=0 ORDER BY RANDOM() LIMIT 1`)

      if (new_c && new_c.length > 0) {
        await db.run(
          "INSERT INTO Flop (challenge_id) VALUES (?)",
          new_c[0].id
        )

        await db.run(
          "UPDATE Challenges SET complete = 1 WHERE id = ?",
          new_c[0].id
        );

      } else {
        console.log("Out of challenges")
      }
      return await db.all("SELECT Flop.id, challenge_id, title, description, reward FROM Flop INNER JOIN Challenges on Flop.challenge_id=Challenges.id");

    } catch (dbError) {
      console.error(dbError)
    }
  },


  // TODO: Below here is mostly useless


  /**
   * Get logs
   *
   * Return choice and time fields from all records in the Log table
   */
  getLogs: async () => {
    // Return most recent 20
    try {
      // Return the array of log entries to admin page
      return await db.all("SELECT * from Log ORDER BY time DESC LIMIT 20");
    } catch (dbError) {
      console.error(dbError);
    }
  },
};
