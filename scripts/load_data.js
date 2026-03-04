const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Database = require('better-sqlite3');

const DATA_FILE = path.join(__dirname, '../src/data/cities500.txt');
const DB_FILE = path.join(__dirname, '../cities.db');

async function loadData() {
    console.log('Initializing database...');
    const db = new Database(DB_FILE);

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');

    // Create tables
    db.exec(`
        DROP TABLE IF EXISTS cities_search;
        DROP TABLE IF EXISTS cities;

        CREATE TABLE cities (
            id INTEGER PRIMARY KEY,
            name TEXT,
            ascii_name TEXT,
            alternate_names TEXT,
            latitude REAL,
            longitude REAL,
            feature_class TEXT,
            feature_code TEXT,
            country_code TEXT,
            cc2 TEXT,
            admin1_code TEXT,
            admin2_code TEXT,
            admin3_code TEXT,
            admin4_code TEXT,
            population INTEGER,
            elevation INTEGER,
            dem INTEGER,
            timezone TEXT,
            modification_date TEXT
        );

        CREATE VIRTUAL TABLE cities_search USING fts5(
            name, 
            region, 
            country, 
            content='cities', 
            content_rowid='id'
        );
    `);

    const insertCity = db.prepare(`
        INSERT INTO cities (
            id, name, ascii_name, alternate_names, latitude, longitude,
            feature_class, feature_code, country_code, cc2,
            admin1_code, admin2_code, admin3_code, admin4_code,
            population, elevation, dem, timezone, modification_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSearch = db.prepare(`
        INSERT INTO cities_search (rowid, name, region, country)
        VALUES (?, ?, ?, ?)
    `);

    const fileStream = fs.createReadStream(DATA_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    console.log('Loading data...');
    let count = 0;
    
    const transaction = db.transaction((lines) => {
        for (const line of lines) {
            const fields = line.split('\t');
            if (fields.length < 19) continue;

            const cityData = [
                parseInt(fields[0]), // id
                fields[1],           // name
                fields[2],           // ascii_name
                fields[3],           // alternate_names
                parseFloat(fields[4]), // latitude
                parseFloat(fields[5]), // longitude
                fields[6],           // feature_class
                fields[7],           // feature_code
                fields[8],           // country_code
                fields[9],           // cc2
                fields[10],          // admin1_code
                fields[11],          // admin2_code
                fields[12],          // admin3_code
                fields[13],          // admin4_code
                parseInt(fields[14]) || 0, // population
                parseInt(fields[15]) || 0, // elevation
                parseInt(fields[16]) || 0, // dem
                fields[17],          // timezone
                fields[18]           // modification_date
            ];

            insertCity.run(...cityData);
            insertSearch.run(cityData[0], cityData[1], cityData[10], cityData[8]);
            count++;
        }
    });

    let batch = [];
    for await (const line of rl) {
        batch.push(line);
        if (batch.length >= 1000) {
            transaction(batch);
            batch = [];
            if (count % 10000 === 0) console.log(`Loaded ${count} cities...`);
        }
    }

    if (batch.length > 0) {
        transaction(batch);
    }

    console.log(`Finished! Total cities loaded: ${count}`);
    db.close();
}

loadData().catch(err => {
    console.error('Error loading data:', err);
    process.exit(1);
});
