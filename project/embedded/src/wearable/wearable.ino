#include "heart_rate.h"

#include <Wire.h>

unsigned long previousSecond = 0;
constexpr int oneSecond = 1000;

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing...");

  // initialize all modules and sensors
  initialize_heart_rate_sensor();
}

void loop() {
  heart_rate();

  unsigned long currentSecond = millis();
  if (currentSecond - previousSecond >= oneSecond) {
    previousSecond = currentSecond;
    Serial.println(heart_rate());
  }
}