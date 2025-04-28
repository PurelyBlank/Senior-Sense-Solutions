#include "heart_rate.h"

#include <Wire.h>



void setup() {
  Serial.begin(115200);
  Serial.println("Initializing...");

  initialize_heart_rate_sensor();
}

void loop() {
  // Serial.println(heart_rate());
  Serial.println(millis());
  delay(5000);
}