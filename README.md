## LST Super-Resolution

### Overview

This project enhances low-resolution Land Surface Temperature (LST) data to high resolution using machine learning techniques and auxiliary data like the Normalized Difference Vegetation Index (NDVI). The code processes satellite data for the Île-de-France region (2019) from Google Earth Engine, applying super-resolution methods such as DisTrad, ATPRK, RF-DMS, and CNN.
#### input data: low-resolution LST, low-resolution NDVI, high-resolution NDVI
#### output data: high-resolution LST

### Features
- Data Preprocessing: Loads and cleans LST and NDVI GeoTiff files, aligns land cover masks (urban, vegetation, water), and simulates high- and low-resolution datasets.
- Super-Resolution: Implements methods to upscale low-resolution LST using high-resolution NDVI, with a flexible function to apply the best method (e.g., ATPRK).
- Visualization: Displays high- and low-resolution LST, NDVI, and Red band images

### Data
Source: Google Earth Engine (Landsat 8/MODIS, Île-de-France, 2019)
- Files:
    - Ile_de_France_LST_Mean_2019.tif: Mean LST in Celsius.
    - Ile_de_France_Urban_Mask_2019.tif, Vegetation_Mask_2019.tif, Water_Mask_2019.tif: Land cover masks.
- Preprocessing: Cleans LST values (< -100°C set to NaN), aligns masks, and simulates high/low-resolution datasets.


#### True Color, Ile de France

![Trure_Color](https://github.com/user-attachments/assets/50acf097-c1e2-40ea-a5ba-dbb7f085d22e)

#### LST, Ile de France

![LST](https://github.com/user-attachments/assets/5cefa731-3d68-4e6b-84e0-998460855970)

#### NDVI, Ile de France 

![NDVI](https://github.com/user-attachments/assets/7ad72c79-e57f-4e31-bfb0-4996ee4be58f)

#### LST Dashboard, Ile de France 

![LST_Dashboard](https://github.com/user-attachments/assets/06af6454-15de-4402-9b12-46ae25d483ee)

#### LST Gif 

![0ce05dce59efa79fb9d7866a04d6b2f7-feb449c3e3f9a53bfecfa6025e1d4fe8_getPixels](https://github.com/user-attachments/assets/ba9448ca-c769-483f-9230-9bda6501364c)

