import { describe, it, expect, afterAll } from 'vitest';
const { searchCities, close } = require('../src/index.js');

describe('City Search', () => {
    afterAll(() => {
        close();
    });

    it('should find Torphins in Scotland', () => {
        const results = searchCities('torphins');
        expect(results.length).toBeGreaterThan(0);
        
        const torphins = results.find(c => c.name === 'Torphins');
        console.log(torphins);
        expect(torphins).toBeDefined();
        expect(torphins.country_code).toBe('GB');
        expect(torphins.admin1_code).toBe('SCT');
    });

    it('should find London', () => {
        const results = searchCities('London');
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].name).toContain('London');
    });

    it('should return empty array for non-existent city', () => {
        const results = searchCities('NonExistentCityXYZ');
        expect(results.length).toBe(0);
    });
});
