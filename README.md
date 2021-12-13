# Project

**webdc** is *experimental* web application and library for downloading dive logs from dive computers from a browser without installing any additional software.

The library is based on [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) supported by many browsers. The library could be extended with [Web USB](https://developer.mozilla.org/en-US/docs/Web/API/USB) and [Web Bluetooth](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) in future.

This work is primarely based on another great opensource project [libdivecomputer](https://www.libdivecomputer.org/) and can be considered as a port of libdivecomputer to JavaScript/TypeScript.

**webdc** is being created as an integral part of https://diveboard.com and corresponding [open source repo](https://github.com/Diveboard/diveboard-web/).


![Screenshot](/doc/images/Screenshot_1.png "Screenshot")


## Currently supported devices
- Suunto Vyper
- Suunto Stinger
- Suunto Mosquito
- Suunto Vytec
- Suunto Cobra
- Suunto Gekko

# Quick start

The app is React based web app.

- Install nodejs with npm (download [here](https://nodejs.org/en/download/)).
- Execute `npm install` and `npm start` in the project directory
- Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
- Connect your dive computer to PC and select *Add Device*
- Enjoy!

## Tests
The porject includes set of unit tests. You can run them with `npm test`

# Device emulation
If you want to emulate real device then following guidlines might be helpful:

1. Use libdivecomputer simulator https://www.libdivecomputer.org/simulator.html

2. Insall null modem emulator com0com from /tools folder.

3. Binary dumps of devices you can make yourself you can use https://www.divinglog.de/ desktop app, select in desktop app click Downloader and select "Log Errors" and "Dump File" options. Connect your device and download dives. Your dives will be exported into binary file which can be used by libdivecomputer simulator. 

4. My own Viper dump you can find in /samples folder.
You can run it by `.\simulator-win32.exe -b vyper -p com1 ..\samples\Downloader\DC_FAMILY_SUUNTO_VYPER.bin`