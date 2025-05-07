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
    `INSERT INTO Challenges (title, reward, description, complete) VALUES
           ('Read aloud an entire picture book at a library.', 'Take a scooter 10 minutes to the east.', 'Narrate an entire picture book out loud.', 0),
           ('Play the alphabet game', 'Take a scooter 5 minutes to the north.', 'Find every letter of the alphabet in order. Letters must be outside and on signage.', 0),
           ('Find 5 countries at a museum', 'Take a scooter 10 minutes.', 'Go to a museum and find exhibits that reference 5 different countries.', 0),
           ('Find a former University president ', 'Ride the bus 5 minutes to the north.', 'Find a sculpture. portrait, or landmark named for a former IU president and take a selfie with it.', 0),
           ('Earn a dollar busking', 'Take an uber 2 miles.', 'You may not ask for the dollar directly in conversation, but you can ask through singing, dancing, miming, signage, or any similar form.', 0),
           ('Solve a puzzle in a physical issue of the IDS', 'Ride the bus 15 minutes.', 'You must find a physical IDS newspaper and complete either the crossword or the sudoku; you cannot use the internet.', 0),
           ('Find a Statue and Recreate It', 'Take a scooter 5 minutes.', 'You must hold the pose for at least a minute. You cannot use the internet to locate the statue.', 0),
           ('Show your Pride', 'Ride the bus 15 minutes.', 'Take selfies with 3 publicly displayed pride flags!', 1),
           ('Two Tea Times', 'Ride the bus 15 minutes.', 'Order 2 different types of tea from 2 different restaurants or cafés (i.e. 2 teas in total)', 0),
           ('Bark Break', 'Ride the bus 15 minutes.', 'Pet 3 dogs', 0),
           ('Advocate for a Clean Bloomington', 'Take a scooter 5 minutes to the west.', 'Throw away 10 items of litter and advocate proper recycling practice to 10 people', 0),
           ('Transport water', 'Take an uber 2.5 miles.', 'Must bring at least a cup of water from one body of water to another. The bodies may be man-made, but must be wadeable', 0),
           ('Piggyback Ride', 'Take an uber 1.5 miles.', 'You must give your teammate a piggyback ride around the entire perimeter of a local park. You may switch off at any point. A park is any area on the map with "park" in the title.', 0),
           ('Karaoke Dokie', 'Ride the bus 20 minutes.', 'Have a stranger sing a song with you for at least 30 seconds', 0),
           ('Split, split, split!', 'Ride the bus 20 minutes to the east.', 'Share a banana split with your teammate while discussing fun facts about Split, Croatia. mmmmmm yummy!', 0),
           ('Hit Core', 'Ride the bus 15 minutes.', 'Your team must complete 100 burpees. You and your partner can switch off, but cannot do them concurrently.', 0),
           ('Copycat catwalk', 'Ride the bus 30 minutes.', 'Recreate your team member&rsquo;s outfit without using any clothing items directly on your teammate. The outfit must consist of real clothes.', 0),
           ('Squirrel Snack Supply', 'Take a scooter 10 minutes', 'Pick out a food item that you think a squirrel would like. You must then offer it to a squirrel, and the squirrel should eat the item within 15 seconds. Otherwise you must find a different squirrel.', 1),
           ('Find your Other Half', 'Take an uber 2 miles.', 'Using a ring or ring-alternative, propose to a stranger in public and have them say, &ldquo;yes.&rdquo;', 0),
           ('Modern Architecture', 'Ride the bus 20 minutes.', 'Use french fries to construct a freestanding structure at least 6 inches tall. The structure must support its own weight for 10 seconds for the challenge to be completed.', 0),
           ('Rainbow Collection', 'Take a scooter 10 minutes.', 'Find 6 plants, one displaying each of the 6 colors of the rainbow. (Red, Orange, Yellow, Green, Blue, Purple)', 0),
           ('Swingin&rsquo; Party', 'Take an uber 2 miles south.', 'Spend 5 minutes swinging on a swing set.', 1),
           ('Worm', 'Ride the bus 10 minutes.', 'Pet a worm.', 0),
           ('Pictionary with strangers', 'Take a scooter 15 minutes.', 'Get three strangers to say the words jet lag, frisbee, and newspaper based only of a drawing. A different stranger must guess each of the words. If you speak to the stranger, they are disqualified from guessing any of the words. The drawing cannot contain letters.', 0),
           ('What&rsquo;s in your jeep?', 'Take an uber 1.5 miles west.', 'As a team, perform the first verse of The Lonely Island&rsquo;s "Things in my jeep." You can look up the lyrics and memorize for as long as you need, but when you perform you cannot use any lyric assistance. Check afterwards, and if you made any mistakes, you can retry after a 2 minute cooldown.', 0),
           ('Skip stones', 'Ride the bus 15 minutes.', 'Skip a stone for at least 3 bounces.', 1),
           ('William tell', 'Ride the bus 15 minutes.', 'Use any object to knock an apple off your teammates head from at least 15 ft away.', 0),
           ('McMeal', 'Ride the bus 15 minutes.', 'Eat something with the letters "Mc"  in its name. The letters must be next to each other (No Mac and Cheese, sorry!)', 0),
           ('Geoguessr', 'Ride the bus 15 minutes.', 'Find and place yourself in one of these photos! You may not use google maps or street view to assist your search.', 0),
           ('Taste test', 'Take a scooter 5 minutes south.', 'Obtain gummy bears, worms, or jelly beans. Have a blindfolded team member guess 3 correct flavors or colors in a row. If you fail, you must wait a 3 minute cooldown before trying again. You may practice, but must declare an official attempt.', 0)
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


async function dbLog(msg) {
  await db.run("INSERT INTO Log (action, time) VALUES (?, ?)", [
    msg,
    new Date().toISOString()
  ]);
}

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

    dbLog("Reshuffle");
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

      let res = await db.all(`SELECT Teams.name, Challenges.reward FROM 
        TeamTickets INNER JOIN Challenges on TeamTickets.challenge_id = Challenges.id
        INNER JOIN Teams on Teams.id = TeamTickets.team_id
        WHERE TeamTickets.challenge_id = ? AND TeamTickets.old = 0
        `, challenge_id)


      await db.run(
        "UPDATE Challenges SET spent=1 WHERE id = ?",
        challenge_id
      )

      await db.run(
        "UPDATE TeamTickets SET old=1 WHERE challenge_id=?",
        challenge_id
      )

      if (res) {
        dbLog(`${res[0].name} spent ${res[0].reward}`);
      } else {
        dbLog("Someone spent something")
      }
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

      if (!(challenge_id && challenge_id.length > 0)) {
        console.error("Unable to find challenge with correct id")
      }
      // console.log(challenge_id)

      // Team is where Id matches dest
      let challenge_name = await db.all(`SELECT title FROM Challenges WHERE id=?`, challenge_id[0].challenge_id)

      await db.run(
        `DELETE FROM Flop WHERE id=${flop_id}`
      )

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


        let team_name = await db.all(
          "SELECT name FROM Teams where id = ?", dest
        )

        dbLog(`${team_name[0].name} completed ${challenge_name[0].title}`)
      }
      else {
        await db.run(
          "UPDATE Challenges SET complete = 2, spent=1 WHERE id = ?",
          challenge_id[0].challenge_id
        );

        dbLog(`${challenge_name[0].title} was vetoed`)
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
