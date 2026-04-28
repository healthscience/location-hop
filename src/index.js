const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');

const getDatabasePath = () => {
    // 1. Construct the standard HOP models path
    let homedir = os.homedir();
    let modelsPath = '';

    if (os.platform() === 'win32') {
        let splitLast = homedir.split('\\');
        let username = splitLast[splitLast.length - 1];
        modelsPath = path.join('C:', 'Users', username, 'hop-models');
    } else {
        modelsPath = path.join(homedir, '.hop-models');
    }

    const homeDbPath = path.join(modelsPath, 'place', 'cities.db');

    // 2. Check if the home directory version exists
    if (fs.existsSync(homeDbPath)) {
        return homeDbPath;
    }

    // 3. Fallback to the local node_modules version (Dev mode / Isolated use)
    return path.join(__dirname, '../cities.db');
};

const DB_FILE = getDatabasePath();
let db;

/**
 * Initialize the database connection
 */
function init() {
    if (!db) {
        db = new Database(DB_FILE, { readonly: true });
    }
}

/**
 * Search for cities using FTS5
 * @param {string} query - The search term
 * @param {number} limit - Maximum number of results (default 10)
 * @returns {Array} - Array of matching cities
 */
function searchCities(query, limit = 10) {
    init();
    
    // Using FTS5 MATCH for lightning-fast search
    // We join with the main cities table to get full details
    const stmt = db.prepare(`
        SELECT 
            c.*,
            s.rank
        FROM cities_search s
        JOIN cities c ON c.id = s.rowid
        WHERE cities_search MATCH ?
        ORDER BY rank
        LIMIT ?
    `);

    return stmt.all(query, limit);
}

/**
 * Close the database connection
 */
function close() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = {
    searchCities,
    close
};
