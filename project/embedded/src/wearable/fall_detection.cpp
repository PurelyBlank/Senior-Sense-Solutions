#include "fall_detection.h"
#include "Gyro_QMI8658.h"

namespace FallDetection {

  void hasFallen() {
    float accelMag = getAccelMagnitude();
    float gyroMag = getGyroMagnitude();

    fallBufAccel[fallBufAccelIndex] = accelMag;
    fallBufAccelIndex = (fallBufAccelIndex + 1) % fallBufLen;

    fallBufGyro[fallBufGyroIndex] = gyroMag;
    fallBufGyroIndex = (fallBufGyroIndex + 1) % fallBufLen;

    float avgAccelMagnitude = 0;
    float avgGyroMagnitude = 0;
    for (int i = 0; i < fallBufLen; i++) {
      avgAccelMagnitude += fallBufAccel[i];
      avgGyroMagnitude += fallBufGyro[i];
    }
    avgAccelMagnitude /= fallBufLen;
    avgGyroMagnitude /= fallBufLen;

    unsigned long t = millis();
    // printf("%.2f %.2f %.2f %.2f\n", accelMag, avgAccelMagnitude + fallAccelThreshold, gyroMag, avgGyroMagnitude + fallGyroThreshold);

    // // 1) Impact spike
    if (accelMag > (avgAccelMagnitude + fallAccelThreshold) && gyroMag > (avgGyroMagnitude + fallGyroThreshold) && !potentialFall) {
      potentialFall = true;
    }

    // 2) Check for stillness
    if (potentialFall) {
      vTaskDelay(pdMS_TO_TICKS(500)); // ensure stillness
      int totalIterations = 0;
      float totalAccelMag = 0;
      float totalGyroMag = 0;
      for (unsigned long s = millis(); millis() - s < stillWindow; ++totalIterations) {
        totalAccelMag += getAccelMagnitude();
        totalGyroMag += getGyroMagnitude();
        vTaskDelay(pdMS_TO_TICKS(100));
      }
      // printf("%.2f | %d\n", totalGyroMag, totalIterations);
      // printf("%.2f | %.2f\n", totalAccelMag / totalIterations, totalGyroMag / totalIterations);

      if (totalGyroMag / totalIterations < stillnessThreshold) {
        ++fallCount;
      }
      potentialFall = false;
    }
  }

  int getFallCount() {
    return fallCount;
  }

  void resetFallCount() {
    fallCount = 0;
  }
}