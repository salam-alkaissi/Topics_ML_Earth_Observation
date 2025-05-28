// Define the region of interest (Île-de-France)
var regions = ee.FeatureCollection("FAO/GAUL/2015/level1")
    .filter(ee.Filter.eq('ADM1_NAME', 'Ile-de-France'));
var aoi = regions.geometry();

// Load the Copernicus Global Land Cover dataset (2019 version)
var landCover = ee.Image('COPERNICUS/Landcover/100m/Proba-V-C3/Global/2019')
    .select('discrete_classification')
    .clip(aoi);

// Create binary masks for urban, vegetation, and water
// Copernicus classification codes:
// Urban: 50 (Built-up)
// Vegetation: 20 (Shrubs), 30 (Herbaceous vegetation), 40 (Cropland), 111-116 (Forests)
// Water: 80 (Permanent water bodies)
var urbanMask = landCover.eq(50); // Urban
var vegetationMask = landCover.gte(20).and(landCover.lte(40)).or(landCover.gte(111).and(landCover.lte(116))); // Vegetation
var waterMask = landCover.eq(80); // Water

// Visualize the masks
Map.setCenter(2.3522, 48.8566, 8);
Map.addLayer(urbanMask, {palette: ['red']}, 'Urban Mask');
Map.addLayer(vegetationMask, {palette: ['green']}, 'Vegetation Mask');
Map.addLayer(waterMask, {palette: ['blue']}, 'Water Mask');

// Export the masks to Google Drive
Export.image.toDrive({
    image: urbanMask,
    description: 'Ile_de_France_Urban_Mask_2019',
    scale: 100,
    region: aoi,
    folder: 'EarthObservation_LST',
    maxPixels: 1e13
});

Export.image.toDrive({
    image: vegetationMask,
    description: 'Ile_de_France_Vegetation_Mask_2019',
    scale: 100,
    region: aoi,
    folder: 'EarthObservation_LST',
    maxPixels: 1e13
});

Export.image.toDrive({
    image: waterMask,
    description: 'Ile_de_France_Water_Mask_2019',
    scale: 100,
    region: aoi,
    folder: 'EarthObservation_LST',
    maxPixels: 1e13
});
