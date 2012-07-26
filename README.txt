glomo is a suite of software that turns Arduino hardware into a portable
LED canvas.


REQUIREMENTS

glomo has been tested with Arduino Duemilanove and Uno platforms. It expects
a platform with at least 2K of SRAM and 1K of EEPROM, though smaller systems
may work as well. At the time of this writing, the software suite works 
with systems compatible with Node.js, namely Windows, Mac, and Linux

Other hardware required:

Color Shield by iTead Studio
http://imall.iteadstudio.com/im120417002.html

8x8 LED matrix

6x AA battery pack
http://www.beboxx.com/coen/arduino-6-x-aa-battery-pack.html

It depends on the following software libraries:

Arduino:

Colorduino
https://github.com/lincomatic/Colorduino

Node.js modules (installed via npm):

connect
websock
serialport

Javascript (included in distro):

tinybox
http://www.scriptiny.com/2011/03/javascript-modal-windows

jscolor
http://jscolor.com/


OVERVIEW

There are three included software components:

glomo_arduino.ino

This file is compiled and flashed to the board via the Arduino IDE. It listens 
for commands from the serial port when connected over USB. When instructed,
it will save the current image to EEPROM for display when booted. This allows
the image to be displayed when powered by AA batteries and disconnected
from the computer.

webserial.js

This Node.js program is responsible for bridging the gap between the browser and
Arduino. It passes commands from the javascript paint app (draw.js) using the
websocket protocol, and negotiates the serial connection with Arduino. 
webserial.js also takes care of flow control, ensuring that the Arduino
can keep up with commands from the browser. 

draw.js / index.html

These files represent the javascript paint app used to make glomo pictures. 
Initially the program will sync with the Arduino by requesting the contents
of its “pix” buffer (populated by the EEPROM upon start). Once connected and
synched, the paint app will send new pixels in real-time as they are painted
on the screen. The “Save to EEPROM” button will cause the Arduino to write
the current display into nonvolatile storage and display the image by default
when powered on.


INSTALLATION

Based on the number of platforms and versions, and considering that glomo is as
much a good learning tool as it is a toy, this doc will try to get you up and 
running with your own Arduno/Node environment, allowing you to customize and
add modules at will.


1 Arduino

First, install the latest Arduino IDE from the Arduino website:
http://www.arduino.cc/

Once you have the necessary hardware components, assemble them and connect
via USB to the computer.

Launch the Arduino IDE and follow the provided instructions to configure the 
software to use the specific type of Arduino board you have, and take note of
the serial port device name in use (bottom right-hand corner of the screen). 
This will often be detected automatically.

Load the glomo_arduino.ino file from the glomo distribution into the Arduino 
IDE.

Click Upload to flash the image onto the Arduino hardware.


2. Node.js

Node.js provides a webserver for hosting the paint application, a websocket 
server to facilitate realtime communication with the browser, and a serial 
library for talking to the Arduino hardware via USB. It is a powerful
platform that fits this purpose  well, however there are some steps involved
in getting the environment working. 

In order to get Node.js and the required modules working, you will need: 

A development environment capable of compiling C code, and
A working Python installation

To get C code compiling, here are tips by platform.

Mac: This can be achieved by installing the free XCode package from 
http://developer.apple.com/xcode/

Linux: This varies by distribution, but normally there is a development package 
available. For example on Ubuntu and Debian, this should work:

apt get install build-essential

Windows: Visual Studio 2010 Express is required in order to compile Node 
modules on Windows platforms. This article offers help with building Node apps 
on Windows:
http://dailyjs.com/2012/05/17/windows-and-node-3/


In addition, a working Python installation is required for compiling some 
libraries, including serialport. These modules use the ‘node-gyp’ system for 
building modules:

https://github.com/TooTallNate/node-gyp/

Python version 2.7.2 is recommended by the node-gyp author as of this writing. 
Most Linux distributions offer Python by default, as does the Mac (though a 
newer build may be required by node-gyp, depending on which version of the OS 
you are using)


Once these requirements are met, copy the glomo files to the desired location. 
We will use “npm” (Node Package Manager) to install the required libraries.

Open a command prompt and ‘cd’ to the glomo directory. First we will install 
the node-gyp package, needed to install the other modules.

Type:

npm install -g node-gyp

Once installed, use npm to install the remaining modules:

npm install websock
npm install connect
npm install serialport


These files will be installed locally to the glomo directory. Once
finished, barring any compile-time errors, the environment should be 
ready. 

Type

node websocket.js serial_port

substituting “serial_port” with the name of the serial port device that the 
Arduino is connected to. This can be found in the Arduino IDE, bottom
right-hand corner of the window. If no errors are reported, the server
should be ready to use.


3. Browser

Navigate to “127.0.0.1:8082” inside a web browser to see the glomo paint app. 
Use the mouse to paint onto the LED, and change colors using the color palette 
below the grid. Once you are happy with your creation, click “Save to EEPROM” 
to save it onto the board.

Now unplug the Arduino, hook up your AA batteries, and display your glomo with 
pride :)


4. Lego

There is a schematic for a Lego case included in the glomo distribution. It was 
created using Lego Designer - both the resulting PDF and the LXF file for use 
with Lego Designer are included. The case holds up pretty well, though there 
are a few hard-to-find pieces, notably the larger plates. Try BrickLink and 
Rebrickable for places to obtain any missing bricks you might need:

http://www.bricklink.com
http://rebrickable.com


5. Inspiration

Also included inside of the artwork directory is a sheet of really great
8x8 artwork by oryx, as featured here and released under the Creative Commons:

http://forums.tigsource.com/index.php?topic=8970.0

These little guys are perfect for glomo. Let me know if you find more!


6. Future

I’d like to get animated pics working. With 1k of EEPROM, it should be possible 
to fit about 5 frames in there. If you look at the code, I’ve done some work in 
this area:

draw.js supports multiple frames, but the navigation arrows are hidden
draw.js has hidden Copy, Paste, Paste All features for changing multiple frames
arduino_glomo.ino “formats” the whole EEPROM when first turned on


Also, there’s a bit of multiplayer possibility here - the websocket server will 
broadcast server messages to all connected, and anyone connected should be able 
to paint. There’s no sync between clients right now though, so it would be kind 
of a weird cooperative painting experience.


7. Thanks

Thanks to Kurtis Minder and Taylor Banks for their support and encouragement of 
this project.

Thanks to the creators of node.js, Arduino, tinybox.js, color.js, serialport, 
connect, and websock for these great packages.

Enjoy and please send me your creations :)


glomo, (C) 2012 Steve Ocepek

e: nosteve@fastmail.net
t: @nosteve
