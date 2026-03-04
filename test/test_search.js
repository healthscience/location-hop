const { searchCities, close } = require('./src/index.js');

try {
    console.log('Searching for "London"...');
    const start = Date.now();
    const results = searchCities('London');
    const end = Date.now();

    console.log(`Found ${results.length} results in ${end - start}ms:`);
    results.forEach(city => {
        console.log(`- ${city.name} (${city.country_code}, ${city.admin1_code}) - Pop: ${city.population}`);
    });

    console.log('\nSearching for "Paris"...');
    const results2 = searchCities('Paris');
    results2.forEach(city => {
        console.log(`- ${city.name} (${city.country_code}, ${city.admin1_code}) - Pop: ${city.population}`);
    });

} catch (err) {
    console.error('Test failed:', err);
} finally {
    close();
}
