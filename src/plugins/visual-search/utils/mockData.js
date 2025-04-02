/**
 * Generates mock search results for the visual search plugin
 * to help with frontend development without a backend.
 */

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
const getRandomNumber = (min, max) => {
  return Math.random() * (max - min) + min;
};

/**
 * Generate a set of mock search results
 * @param {string} query - The search query
 * @param {number} videoDuration - Duration of the video in seconds
 * @param {number} [resultCount=5] - Number of results to generate
 * @returns {Array} Array of search result objects
 */
const generateMockResults = (query, videoDuration, resultCount = 5) => {
  // Limit the number of results between 1 and 10
  const count = Math.min(Math.max(1, resultCount), 10);
  
  // Create an array of search results
  const results = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a random start time between 0 and (duration - 10 seconds)
    const startTime = getRandomNumber(0, Math.max(0, videoDuration - 10));
    
    // Generate a random segment length between 2 and 10 seconds
    const segmentLength = getRandomNumber(2, Math.min(10, videoDuration - startTime));
    
    // End time is start time plus segment length
    const endTime = startTime + segmentLength;
    
    // Create a mock result object
    results.push({
      start_time: parseFloat(startTime.toFixed(2)),
      end_time: parseFloat(endTime.toFixed(2))
    });
  }
  
  // Sort results by start time
  return results.sort((a, b) => a.start_time - b.end_time);
};

export { generateMockResults }; 
