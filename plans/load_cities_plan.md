# Plan: Load Cities Data into SQLite with FTS5

This plan outlines the steps to load city data from `cities500.txt` into a SQLite database and implement a fast search functionality using FTS5.

## 1. Dependencies
We will use [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) as requested. It is the fastest and most popular SQLite library for Node.js and supports FTS5 out of the box.

## 2. Database Schema
We will create a table `cities` to store the raw data and a virtual table `cities_search` for full-text search.

### Table: `cities`
| Column | Type | Description |
| --- | --- | --- |
| id | INTEGER PRIMARY KEY | Geoname ID |
| name | TEXT | Name of geographical point |
| ascii_name | TEXT | Name in plain ascii characters |
| alternate_names | TEXT | Comma separated alternate names |
| latitude | REAL | Latitude in decimal degrees |
| longitude | REAL | Longitude in decimal degrees |
| feature_class | TEXT | See geonames.org |
| feature_code | TEXT | See geonames.org |
| country_code | TEXT | ISO-3166 2-letter country code |
| cc2 | TEXT | Alternate country codes |
| admin1_code | TEXT | FIPS code (region) |
| admin2_code | TEXT | Code for second level administrative division |
| admin3_code | TEXT | Code for third level administrative division |
| admin4_code | TEXT | Code for fourth level administrative division |
| population | INTEGER | Population |
| elevation | INTEGER | Elevation in meters |
| dem | INTEGER | Digital elevation model |
| timezone | TEXT | IANA timezone |
| modification_date | TEXT | Date of last modification |

### Virtual Table: `cities_search` (FTS5)
```sql
CREATE VIRTUAL TABLE cities_search USING fts5(
    name, 
    region, 
    country, 
    content='cities', 
    content_rowid='id'
);
```

## 3. Implementation Steps

### Step 1: Setup
- Install `better-sqlite3`.
- Create a `scripts/load_data.js` to handle the initial import.

### Step 2: Data Loading
- Read `src/data/cities500.txt` line by line (to handle the 35MB file efficiently).
- Parse the tab-separated values.
- Use a transaction to insert data into the `cities` table in batches for performance.
- Populate the `cities_search` virtual table.

### Step 3: Search Function
- Implement a `searchCities(query)` function in [`src/index.js`](src/index.js).
- Use the `MATCH` operator for FTS5 searching.

## 4. Verification
- Run a few test queries to ensure the search is "lightning-fast" and returns accurate results.

## 5. Finalization
- Export the search function from the main module.
