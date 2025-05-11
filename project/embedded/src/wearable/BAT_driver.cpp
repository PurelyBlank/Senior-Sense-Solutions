#include "BAT_Driver.h"

float BAT_analogVolts = 0;
constexpr float batteryMin = 3.0;
constexpr float batteryMax = 4.2;

void BAT_Init(void)
{
  //set the resolution to 12 bits (0-4095)
  analogReadResolution(12);
}

float BAT_Get_Volts(void)
{
  int Volts = analogReadMilliVolts(BAT_ADC_PIN); // millivolts
  BAT_analogVolts = (float)(Volts * 3.0 / 1000.0) / Measurement_offset;
  // printf("BAT voltage : %.2f V\r\n", BAT_analogVolts);
  return BAT_analogVolts;
}

double getBatteryPercentage() {
  float voltage = BAT_Get_Volts();

  // Clamp voltage to the expected range
  if (voltage > batteryMax)
    voltage = batteryMax;
  if (voltage < batteryMin)
    voltage = batteryMin;

  double percentage = ((voltage - batteryMin) / (batteryMax - batteryMin)) * 100;
  return percentage;
}