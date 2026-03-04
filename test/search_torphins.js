const { searchCities, close } = require('../src/index.js');

/**
 * Test for specific city search
 */
function testSpecificSearch() {
    const query = 'torphins';
    console.log(`Searching for "${query}"...`);
    
    try {
        const results = searchCities(query);
        
        if (results.length === 0) {
            console.log(`No results found for "${query}".`);
        } else {
            console.log(`Found ${results.length} results:`);
            results.forEach(city => {
                console.log(`- ${city.name} (${city.country_code}, ${city.admin1_code}) - Pop: ${city.population}`);
            });
            
            const found = results.some(c => c.name.toLowerCase() === 'torphins');
            if (found) {
                console.log('SUCCESS: Torphins found in results.');
            } else {
                console.log('FAILURE: Torphins not found in results.');
            }
        }
    } catch (err) {
        console.error('Test failed with error:', err);
    } finally {
        close();
    }
}

testSpecificSearch();
