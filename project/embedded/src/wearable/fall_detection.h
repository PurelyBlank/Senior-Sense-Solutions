#pragma once

#include "Gyro_QMI8658.h"

namespace FallDetection {
  inline constexpr float fallAccelThreshold = 2.5;
  inline constexpr float fallGyroThreshold = 10;
  inline const float stillnessThreshold = 200;   // g
  inline constexpr int fallBufLen = 20;
  inline float fallBufAccel[fallBufLen];
  inline float fallBufGyro[fallBufLen];
  inline int fallBufAccelIndex = 0;
  inline int fallBufGyroIndex = 0;

  inline int fallCount = 0;
  inline bool potentialFall = false;
  inline unsigned long fallImpactTime = 0;
  inline const unsigned long stillWindow = 2000;  // 2 seconds

  void hasFallen();
  int getFallCount();
  void resetFallCount();
}
