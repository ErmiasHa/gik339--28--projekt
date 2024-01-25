const express = require("express");
const server = express();
const sqlite3 = require("sqlite3").verbose();

server.use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    next();
  });




server.get('/', (req, res) => {
  res.send('Välkommen till min Car API!');
});

server.listen(3003, () => {
  console.log("Server is now running on http://localhost:3003.");
});

const db = new sqlite3.Database("database.db");





//  Hämtar alla billar 
server.get("/api/cars", (req, res) => {
  db.all("SELECT * FROM cars", (err, rows) => {
    if (err) {
      console.error("Error fetching all cars:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API Endpoint: Hämta Specifik Bil by licenseplate
server.get("/api/cars/:licenseplate", (req, res) => {
  const licenseplate = req.params.licenseplate;
  db.get("SELECT * FROM cars WHERE licenseplate = ?", [licenseplate], (err, row) => {
    if (err) {
      console.error("Error fetching car:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Car not found" });
      return;
    }
    res.json(row);
  });
});



// Läggar Till Ny Bil 
server.post("/api/cars", (req, res) => {
  const { make, model, licenseplate, color, year, mileage } = req.body;
  const yearNum = parseInt(year, 10);
  const mileageNum = parseInt(mileage, 10);

  if (!make || !model || !licenseplate || !color || isNaN(yearNum) || isNaN(mileageNum)) {
    res.status(400).json({ error: "Invalid car data" });
    return;
  }

  const insertData = db.prepare("INSERT INTO cars (make, model, licenseplate, color, year, mileage) VALUES (?, ?, ?, ?, ?, ?)");
  insertData.run(make, model, licenseplate, color, yearNum, mileageNum, function(err) {
    if (err) {
      console.error("Error adding new car:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ message: "Car added successfully", licenseplate: licenseplate });
  });
});


//  Uppdatera Bilinformation by licenseplate
server.put("/api/cars/:licenseplate", (req, res) => {
  const licenseplate = req.params.licenseplate;
  const { make, model, color, year, mileage } = req.body;
  const yearNum = parseInt(year, 10);
  const mileageNum = parseInt(mileage, 10);

  if (isNaN(yearNum) || isNaN(mileageNum)) {
    res.status(400).json({ error: "Invalid car data" });
    return;
  }

  db.run("UPDATE cars SET make = ?, model = ?, color = ?, year = ?, mileage = ? WHERE licenseplate = ?", 
    [make, model, color, yearNum, mileageNum, licenseplate], (err) => {
      if (err) {
        console.error("Error updating car:", err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Car updated successfully", licenseplate: licenseplate });
  });
});


//  Delete a specific car by licenseplate
server.delete("/api/cars/:licenseplate", (req, res) => {
  const licenseplate = req.params.licenseplate;

  db.run("DELETE FROM cars WHERE licenseplate = ?", [licenseplate], function(err) {
    if (err) {
      console.error("Error deleting car:", err.message);
      res.status(500).json({ error: "Could not delete car" });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "No car found with this licenseplate" });
      return;
    }
    res.json({ message: "Car deleted successfully" });
  });
});



// Middleware for error handling
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
