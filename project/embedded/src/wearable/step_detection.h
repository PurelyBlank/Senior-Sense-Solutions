#pragma once

#include "Gyro_QMI8658.h"

namespace StepDetection {

  inline constexpr float stepThreshold = 0.2;   // Adjust this threshold for step detection sensitivity
  inline constexpr int stepBufferLength = 15;  // Number of accelerometer readings in the buffer
  inline float stepBuffer[stepBufferLength];
  inline int stepBufferIndex = 0;
  inline int stepCount = 0;
  inline bool stepDetected = false;
  inline int totalStepCount = 0;

  inline constexpr unsigned long debounceDelay = 500;  // Debounce delay in milliseconds
  inline unsigned long lastStepTime = 0;

  void getStep();
  int getStepCount();
  void resetStepCount();
  int getTotalStep();
  void resetTotalStep();
}