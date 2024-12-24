# Epaper_Dashboard

The Epaper_Dashboard is designed for OpenEpaperLink and Epaper tags to display static or less frequently updated messages such as today's weather, weather forecasts, calendars, and even to - do lists - basically anything you can imagine.

## Working Method
The main working mechanism involves generating images via Node.js and Express, and then having these images retrieved by API. Interestingly, I initially hoped to deploy it to Vercel. However, as we know, the node canvas library requires external extensions. Consequently, I had to abandon this approach and find a new pure - JS alternative library, pureimage.

## Major Functions (Currently)
1. **Weather**
   - You can obtain weather information.
   - ## How to get:
     - The URL format is 'yourwebsite.com/weather/yourcityname - yourcityid'. You can get the cityid from [https://github.com/qwd/LocationList](https://github.com/qwd/LocationList).
   - ## What it returns (planned as JPEG):
     - Current weather.
     - Current temperature.
     - Current AQI (planned).
   - ## Future Plan:
     - Add more parameters.

2. **Chinese Traditional Calendar**
   - ## How to get:
     - The URL is 'yourwebsite.com/getlunarimg'.
   - ## What it returns:
     - Date.
     - Lunar date.
     - Wuhou.
     - Shujiu.
     - Fu.
     - Ganzhi date.
     - Festivals all over the world.
   - ## Future Plan:
     - Add more parameters.

3. **Get Moon Message (Under Debugging)**

4. **Get Sun Message (Under Debugging)**

5. **Get Your Course Information (Under Debugging)**

## Planned or Upcoming Functions
1. **Get Air Quality**
2. **Count Down**


Here is a simple example of how the Node.js and Express part might look like for the weather functionality (this is a very basic example and may need further modification according to your actual situation):

```javascript
const express = require('express');
const app = express();
const port =
