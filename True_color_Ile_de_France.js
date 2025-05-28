// ILE DE FRANCE TRUE COLOR IMAGE
var aoi = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1")
    .filter(ee.Filter.eq('ADM1_NAME', 'Ile-de-France'));
Map.addLayer(aoi, {}, 'AOI - Ile-de-France');
// Map.centerObject(aoi, 10);
Map.setCenter(2.3522, 48.8566, 7); // Default to Paris, France

var startDate = '2023-06-01';
var endDate = '2023-09-21';
// Applies scaling factors.
function applyScaleFactors(image) {
 // Scale and offset values for optical bands
 var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
 
 // Scale and offset values for thermal bands
 var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
 
 // Add scaled bands to the original image
 return image.addBands(opticalBands, null, true)
 .addBands(thermalBands, null, true);
}

// Function to Mask Clouds and Cloud Shadows in Landsat 8 Imagery

function cloudMask(image) {
  // Define cloud shadow and cloud bitmasks (Bits 3 and 5)
  var cloudShadowBitmask = (1 << 3);
  var cloudBitmask = (1 << 5);

  // Select the Quality Assessment (QA) band for pixel quality information
  var qa = image.select('QA_PIXEL');

  // Create a binary mask to identify clear conditions (both cloud and cloud shadow bits set to 0)
  var mask = qa.bitwiseAnd(cloudShadowBitmask).eq(0)
                .and(qa.bitwiseAnd(cloudBitmask).eq(0));

  // Update the original image, masking out cloud and cloud shadow-affected pixels
  return image.updateMask(mask);
}

// Import and preprocess Landsat 8 imagery
var image = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
              .filterBounds(aoi)
              .filterDate(startDate, endDate)
              .map(applyScaleFactors)
              .map(cloudMask)
              .median()
              .clip(aoi);

// Define visualization parameters for True Color imagery (bands 4, 3, and 2)
var visualization = {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0.0,
  max: 0.15,
};

// Add the processed image to the map with the specified visualization
Map.addLayer(image, visualization, 'True Color 432');

var imageToExport = image.select(['SR_B4', 'SR_B3', 'SR_B2']);

// Export the image to your Google Drive
Export.image.toDrive({
  image: imageToExport,
  description: 'Ile_de_France_TrueColor_2023', // A name for the export task
  folder: 'GEE_Exports', // Optional: a folder in your Google Drive
  fileNamePrefix: 'Ile_de_France_TrueColor_2023', // The desired filename
  scale: 30, // The resolution in meters (Landsat 8 SR bands are 30m)
  region: aoi.geometry(), // Export the image clipped to your AOI
  fileFormat: 'GeoTIFF', // You can also choose other formats like 'TFRecord'
  maxPixels: 1e10 // Increased maxPixels to handle potentially large images
});