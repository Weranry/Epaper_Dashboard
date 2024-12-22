# Epaper_Dashboard

For OpenEpaperLink and Epaper tags to display some static or not need always refresh message. such as today weather or weather forecast,calendar,even ti do list and all of you can imagined it.
The main working method is to generate images through Node.js and Express and have them obtained by AP.
It's interesting that I hope to deploy to Vercel, but as we all know, the node canvas library requires external extensions, so I had to give it up and find a new pure JS alternative library pureimage.

## major function(currently)

- Weather
- chinese traditional calendar
- get moon message(debuging）
- get sun message（debuging）
- get your course information(deuging)

## Planned or upcoming function

- get air quality
- count down

## detailed introduction

### get weather

#### get

'yourwebsite.com/weather/yourcityname-yourcityid'
-you can get cityid from  https://github.com/qwd/LocationList

#### return jpeg
-now weather
-now temp.
-now aqi(palnned）

#### Plan
-Add more parameters

### get calendar
based on Lunar-Javascript

#### get
'yourwebsite.com/getlunarimg'

#### return
-date
-lunar date
-wuhou
-shujiu
-fu
-ganzhi date
-festival all over the world

#### plan
-Add more parameters
