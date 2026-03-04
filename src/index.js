const Database = require('better-sqlite3');
const path = require('path');

const DB_FILE = path.join(__dirname, '../cities.db');
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
