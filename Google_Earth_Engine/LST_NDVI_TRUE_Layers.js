// with dashboard
// Define the region of interest (Île-de-France)
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

// // Export the image to your Google Drive
// Export.image.toDrive({
//   image: imageToExport,
//   description: 'Ile_de_France_TrueColor_2023', // A name for the export task
//   folder: 'GEE_Exports', // Optional: a folder in your Google Drive
//   fileNamePrefix: 'Ile_de_France_TrueColor_2023', // The desired filename
//   scale: 30, // The resolution in meters (Landsat 8 SR bands are 30m)
//   region: aoi.geometry(), // Export the image clipped to your AOI
//   fileFormat: 'GeoTIFF', // You can also choose other formats like 'TFRecord'
//   maxPixels: 1e10 // Increased maxPixels to handle potentially large images
// });

// Calculate Normalized Difference Vegetation Index (NDVI)
var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');

// Define NDVI Visualization Parameters
var ndviPalette = {
 min: -1,
 max: 1,
 palette: ['blue', 'white', 'green']
};

Map.addLayer(ndvi, ndviPalette, 'NDVI Ile-de-France')

// Select Thermal Band (Band 10) and Rename It
var thermal = image.select('ST_B10').rename('thermal');

// Now, lets calculate the land surface temperature (LST)

// Formula: (TB / (1 + (λ * (TB / 1.438)) * ln(em))) - 273.15
var lst = thermal.expression(
  '(TB / (1 + (0.00115 * (TB / 1.438)) * log(em))) - 273.15', {
    'TB': thermal.select('thermal'), // Select the thermal band (TB)
    'em': 1.0 // Assign emissivity (em)
  }).rename('LST Ile de France 2023');

// Add the LST Layer to the Map with Custom Visualization Parameters
Map.addLayer(lst, {
  min: 18.47, // Minimum LST value
  max: 42.86, // Maximum LST value
  palette: [
    '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
    '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
    '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
    'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
    'ff0000', 'de0101', 'c21301', 'a71001', '911003'
  ]}, 'Land Surface Temperature 2023');
  
  // Create a Legend for Land Surface Temperature (LST) Visualization
var minLST = 15; // Minimum LST value
var maxLST = 45; // Maximum LST value

// Create a panel for the legend with styling
var legend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px',
    backgroundColor: 'white'
  }
});

// Create a title for the legend
var legendTitle = ui.Label({
  value: 'Land Surface Temperature (°C)',
  style: {
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});

// Add the legend title to the legend panel
legend.add(legendTitle);

// Define a color palette for the legend
var palette = [
  '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
  '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
  '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
  'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
  'ff0000', 'de0101', 'c21301', 'a71001', '911003', '210300'
];

// Calculate the step value for the legend
var step = (maxLST - minLST) / (palette.length - 1);

// Loop through the palette and create legend entries
for (var i = 0; i < palette.length; i++) {
  // Create a color box for each legend entry
  var colorBox = ui.Label({
    style: {
      backgroundColor: '#' + palette[i],
      padding: '8px',
      margin: '0 0 8px 0',
      width: '42px'
    }
  });

  // Create a label with LST values for each legend entry
  var legendLabel = ui.Label({
    value: (minLST + i * step).toFixed(2),
    style: { margin: '0 0 10px 6px' }
  });

  // Create a panel to arrange color box and label horizontally
  var legendPanel = ui.Panel({
    widgets: [colorBox, legendLabel],
    layout: ui.Panel.Layout.Flow('horizontal')
  });

  // Add the legend entry panel to the main legend panel
  legend.add(legendPanel);
}

// Add the legend to the Google Earth Engine map
Map.add(legend);

// Create a Map Title
var mapTitle = ui.Panel({
  style: {
    position: 'top-center',
    padding: '20px 20px'
  }
});
var mapTitle2 = ui.Label({
  value: 'Land Surface Temperature - 2019 - Ile de France',
  style: {
    fontWeight: 'bold',
    fontSize: '30px',
    margin: '8px 8px 8px 8px',
    padding: '0'
  }
});
mapTitle.add(mapTitle2);

// Add the map title to the Google Earth Engine map
Map.add(mapTitle);
