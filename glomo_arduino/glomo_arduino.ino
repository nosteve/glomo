#include <Colorduino.h>
#include <EEPROM.h>
#define LEDS 64
#define XMAX 7
#define YMAX 7
#define BAUD_RATE 9600
#define EEPROM_SIZE 1024
#define SCR_DELAY 100 //ms between screen updates
#define smillis() ((long)millis())


// RT data format
// XX,YY,RR,GG,BB in hex
#define CMD_BUFFER 15

int buf;                     //incoming serial data
char cmd[CMD_BUFFER];        //cmd to be processed
byte pix[LEDS*3];                //stores values of LEDs

boolean invalid = false;
int x;
int y;
int r;
int g;
int b;
int si;                      //serial count
long timeout=smillis()+SCR_DELAY; //for timer

//Julian Skidmore's rollover-proof timer
boolean after(long timeout) {
    return smillis()-timeout>0;
}

void render() {
  /*
  for (int x=0; x < LEDS; x++) {
    //Set each led according to values in led array
    Colorduino.SetPixel(x,0,led[x][0],led[x][1],led[x][2]);
  }
  */
  Colorduino.FlipPage();
}


void flush_buffer() {
  for (int x = 0; x < CMD_BUFFER; x++) {
    cmd[x] = 0;
  }
  while(Serial.available() > 0) {
    Serial.read();
  }
  si=0;
  Serial.print("Z");
  Serial.flush();
}

int tohex(int a) {
  if (a > 47 && a < 58) {
    return a - 48;
  }
  else if (a > 64 && a < 71) {
    return a - 55;
  }
}

void setup() {
  // initialize serial communication:
  Serial.begin(BAUD_RATE);
  Colorduino.Init(); // initialize the board
  //Colorduino.FlipPage();
  
  // compensate for relative intensity differences in R/G/B brightness
  // array of 6-bit base values for RGB (0~63)
  // whiteBalVal[0]=red
  // whiteBalVal[1]=green  
  // whiteBalVal[2]=blue
  unsigned char whiteBalVal[3] = {36,63,63}; // for LEDSEE 6x6cm round matrix
  Colorduino.SetWhiteBal(whiteBalVal);
  
  //Is EEPROM formatted for glomo?
  //By default, all values are 255 - we need them to be 0
  //12 in first byte ensures it's formatted
  //BTW I think EEPROM(1) doesn't read correctly, at least on my board
  //Starting with EEPROM 2 for data, 1 for code
  
  if (EEPROM.read(1) != 12) {
    for (int i=2; i < EEPROM_SIZE; i++) {
      EEPROM.write(i, 0);
    }
    EEPROM.write(1, 12);
  }
  
  //Populate pix array from eeprom
  for (int i=0; i < LEDS*3; i++) {
    pix[i] = EEPROM.read(i+2);
  }
  
  //Covert to x,y and light up the LEDs
  for (int i=0; i < LEDS*3; i = i+3) {
    x = (i / 3) % (XMAX + 1);
    y = (i / 3) / (XMAX + 1);
    r = int(pix[i]);
    g = int(pix[i+1]);
    b = int(pix[i+2]);
    Colorduino.FlipPage();
    Colorduino.SetPixel(x,y,r,g,b);
    Colorduino.FlipPage();
  }
}

void readserial() {
  if (si > CMD_BUFFER) {
    flush_buffer();
  }
  else if (Serial.available() > 0) {
    buf = Serial.read();
    //Save command
    if (buf == 83) {
      //Write pix to eeprom
      for (int i = 0; i < LEDS*3; i++) {
        EEPROM.write(i+2, pix[i]);
        //Serial.print(pix[i]);
        //Serial.print("\n");
      }
      flush_buffer();
    }
    //Load command
    if (buf == 76) {
      flush_buffer();
      Serial.print("Y");
      Serial.flush();
      //Send contents of pix array
      for (int i = 0; i < LEDS*3; i++) {
        Serial.print(i);
        Serial.print(",");
        Serial.print(pix[i]);
        Serial.print("\n");
        Serial.flush();
      }
      Serial.print("Z");
      Serial.flush();
    }
    //End of command - CR or LF
    //CR+LF is ok, it'll just cause double flush
    else if (buf == 10 || buf == 13) {
      if (si == (CMD_BUFFER-1)) {
        //Add null
        cmd[si+1] = 0;
        //Valid?
        //Range check
        if (invalid == false) {
          x = tohex(cmd[0])*16 + tohex(cmd[1]);
          if (x > XMAX) {
            invalid = true;
          }
        }
        if (invalid == false) {
          y = tohex(cmd[3])*16 + tohex(cmd[4]);
          if (y > YMAX) {
            invalid = true;
          }
        }
        if (invalid == false) {
          r = tohex(cmd[6])*16 + tohex(cmd[7]);
          g = tohex(cmd[9])*16 + tohex(cmd[10]);
          b = tohex(cmd[12])*16 + tohex(cmd[13]);
          Colorduino.FlipPage();
          Colorduino.SetPixel(x,y,r,g,b);
          Colorduino.FlipPage();
          // Store in array
          // Location is y*8 + x, then 3x for rgb
          int s = (y*8 + x)*3;
          pix[s] = r;
          pix[s+1] = g;
          pix[s+2] = b;
      
          flush_buffer();
        }
        if (invalid == true) {
          flush_buffer();
          invalid = false;
        }
      }
    }
    //still reading data
    //A-Z, 0-9, and comma
    else if ((buf >= 48 && buf <= 57) || (buf >= 65 && buf <= 90) || (buf == 44)) {
      cmd[si] = buf;
      si++;
    }
    else {
      flush_buffer();
    }
  }
}
        
void loop() {
  /*
  if (after(timeout)) {
    render();
    timeout=(long)millis()+SCR_DELAY;
  }
  */
  readserial();
}

