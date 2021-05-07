# motion-thermostat
Motion thermostat uses an [Espruino Puck](http://www.espruino.com/Puck.js#power-consumption) to send temperature data to a local server so 
that a device may be switched on once the ambient temperature exceeds the set temperature threshold. 
The user may flip the puck over (face-side down) to opt to have the fan turned off permanently.

This project utilizes [IFTTT webhooks](https://ifttt.com/maker_webhooks) to receive commands to control other devices. For example, I 
originally started this project in order to control a vent fan that is plugged into a TPLink Kasa 
IoT plug.

## Setup
0) On the IFTTT website, setup two [Web Hooks](https://ifttt.com/maker_webhooks) with the event names: 'puck_on' and
   'puck_off'.
1) Using the [Espruino web IDE](https://chrome.google.com/webstore/detail/espruino-web-ide/bleoifhkdalbjfbobjackfdifdneehpo), 
   flash the code found in 'espruino-puck-code.js' to the Puck.
2) Clone this repository on your choice of server. I opted to use a Raspberry Pi 4 running Ubuntu 20.04.
   However, you may use any computer compatible with Node 14+ and the [@abandonware/noble](https://github.com/abandonware/noble)
   library:
```
$ git clone https://github.com/boomninjavanish/motion-thermostat.git
```
3) In the newly created directory, install any node packages:
```
$ cd motion-thermostat
$ npm install
```
4) Add the following environmental variables via the command line. Be sure to replace the x's with 
   your [Puck's mac address](http://www.espruino.com/Troubleshooting+BLE#how-do-i-find-my-device-s-4-character-id) and the key found in the 
   [IFTTT API URL prefix](https://platform.ifttt.com/docs#2-create-your-service-and-connect-to-ifttt):
```
$ export PUCK_ADDRESS=xx:xx:xx:xx:xx:xx && export IFTTT_API_KEY=xxxxxxxxxxxxxxxxxx
```
5) Run the node script:
```
$ node motion-temperature --verbose
```
If the output looks like this, you were successful:
```
[2021-04-05 06:21:14] - battery: 2.8v, fanOn?: false, temp: 20.8
```

After testing, the script may run like a service using 
[systemd unit files](https://www.suse.com/support/kb/doc/?id=000019672), 
[launchd](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html), 
[node-windows](https://github.com/coreybutler/node-windows), etc. 
Make sure to leave out the `--verbose` flag to reduce the amount of chatter in your log files. 



 
