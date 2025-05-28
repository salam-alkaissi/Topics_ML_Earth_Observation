
//LST
// Define the region of interest (Île-de-France)
var regions = ee.FeatureCollection("FAO/GAUL/2015/level1")
    .filter(ee.Filter.eq('ADM1_NAME', 'Ile-de-France'));
var aoi = regions.geometry();

// Load MODIS LST data (8-day composite)
var lstCollection = ee.ImageCollection('MODIS/061/MOD11A2')
    .filterBounds(aoi)
    .filterDate('2019-01-01', '2019-12-31') // Adjust date range as needed
    .select('LST_Day_1km'); // Select daytime LST band

// Calculate mean LST image and convert to Celsius
var lstMean = lstCollection.mean().multiply(0.02).subtract(273.15);

// Center map on Île-de-France (as per your updated parameters)
Map.setCenter(2.3522, 48.8566, 8);
Map.addLayer(lstMean, {min: 0, max: 40, palette: ['blue', 'yellow', 'red']}, 'Mean LST Île-de-France');

// Export the image to Google Drive
Export.image.toDrive({
    image: lstMean,
    description: 'Ile_de_France_LST_Mean_2019',
    scale: 1000, // MODIS resolution (1km)
    region: aoi,
    folder: 'EarthObservation_LST',
    maxPixels: 1e13
});
