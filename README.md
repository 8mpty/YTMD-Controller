<h1 align="center">
    <img src="https://github.com/8mpty/YTMD-Controller/blob/master/docs/github_images/my-logo.png" alt="YTMD-Controller">
    <br>
    YTMD-Controller
</h1>

## About
`YTMD-Controller` stands for `Youtube Music Desktop - Controller` for short.

Control the [Youtube Desktop Music](https://github.com/th-ch/youtube-music) app from your Android / IOS* / Web* devices.

An [Expo](https://expo.dev/) app written in JavaScript.

UI is HEAVILY inspired on the sadly discontinued [Spotify Car Thing](https://support.spotify.com/us/article/car-thing-discontinued/).

Download [here](https://github.com/8mpty/YTMD-Controller/releases).

Please navigate to the [Disclaimers](https://github.com/8mpty/YTMD-Controller?tab=readme-ov-file#disclaimers) section regarding the devices.

## Features

- Basic control functionalities (play/pause/skip/seek/shuffle/repeat)
- Lyrics intergration ([LRCGET](https://lrclib.net/docs))
- Live Queue
- Local Playlists
- Likes/Playlists Local Database

## To Get Started

1. Ensure that the API Server plugin is `Enabled` in the YouTube Music Desktop application.
2. Ensure that the authorization strategy is set to `No authorization`.
3. Download and install the `YTMD-Controller` to your device.
4. Configure the `Connection Settings` but you may skip this step entirely but there would be functionality limitations.

## Screenshots

More can be found in the [docs folder](https://github.com/8mpty/YTMD-Controller/tree/master/docs/github_images) 

| Main Player | Lyrics |
|:-:|:-:|
| <img src="https://github.com/8mpty/YTMD-Controller/blob/master/docs/github_images/app_main_player.jpeg" width="400" alt="MainPlayer"> | <img src="https://github.com/8mpty/YTMD-Controller/blob/master/docs/github_images/app_lyrics.jpeg" width="400" alt="Lyrics"> |
| **Track Info** | **Clock** |
| <img src="https://github.com/8mpty/YTMD-Controller/blob/master/docs/github_images/app_track_information.jpeg" width="400" alt="Queue"> | <img src="https://github.com/8mpty/YTMD-Controller/blob/master/docs/github_images/app_clock.jpeg" width="400" alt="Library"> |
| **Queue** | **Local Library** |
| <img src="https://github.com/8mpty/YTMD-Controller/blob/master/docs/github_images/app_queue.jpeg" width="400" alt="Queue"> | <img src="https://github.com/8mpty/YTMD-Controller/blob/master/docs/github_images/app_library.jpeg" width="400" alt="Library"> |

## Disclaimers

I am still currently studying in school hence updates and replies to issues may have a few delays.

<details><summary>IOS</summary>
<p>
  
Since for IOS devices, I would need to get hold of an paid* [Apple Developer](https://developer.apple.com/) Account.

For the scope of this project right now, I feel that puchasing this account is not the main priority at this point.

Though I have already tested the application using Expo Go on IOS devices, you can still "Run" this application yourself locally.

<details><summary>Steps</summary>
<p>
  
Step 1: [Clone](https://github.com/8mpty/YTMD-Controller.git) this repo onto your local machine.

Step 2: cd into the project library and Run
```bash
# Ensure you have nodejs install with all the react-native / expo libraries installed
npm install
```

Step 3: To run the development version, run
```bash
npm run start
# or
npm start
```

Step 4: Instal the [Expo Go](https://apps.apple.com/ms/app/expo-go/id982107779) app on your IOS device and scan the QrCode with your Camera app.

Every time you would like to use the app, run the ```npm start``` command again.
</details>
</p> 
</details>


<details><summary>WEB</summary>
<p>
  
I am looking for ways to host my application through the web and am currently looking at [Vercel](https://vercel.com/)

This is not a "main" priority yet hence the only way is to run it locally.

<details><summary>Steps</summary>
<p>
  
Step 1: [Clone](https://github.com/8mpty/YTMD-Controller.git) this repo onto your local machine.

Step 2: cd into the project library and Run
```bash
# Ensure you have nodejs install with all the react-native / expo libraries installed
npm install
```

Step 3: To run the development version, run
```bash
npm run start
# or
npm start
```

Step 4: Open the web portal from the ipaddress given from the terminal like:
```
http://localhost:8081
```

Every time you would like to use the app, run the ```npm start``` command again.
</details>
</p> 
</details>

## Devices Tested

<details><summary>Android</summary>
  
- Samsung S7 (Android 9)
- Honor 10 (Android 10)
- Google Pixel 4a (Android 13)
- Xiaomi Pocophone F1 (Android 13)
- Xiaomi Mi 9T Pro (Android 13)
- Samsung Note 9 (Android 14)
- Nothing Phone 1 (Android 14)
- Honor Magic V2 (Android 15)
  
</details>
  
<details><summary>IOS</summary>
  
- Iphone XR (iOS 17.3)
- Iphone 12 mini (iOS 18.3.1)
  
</details>

<details><summary>WEB Browsers</summary>
  
- Firefox Developer Edition
- Chromium Based Browsers
  
</details>

## TODO Lists

- [ ] IOS Deployment?
- [ ] Web Deployment 
- [ ] Search Functionality
- [ ] Optimizations

## References and Thanks

Youtube Music Desktop (https://github.com/th-ch/youtube-music)
 
Lyrics (https://github.com/tranxuanthang/lrcget)
