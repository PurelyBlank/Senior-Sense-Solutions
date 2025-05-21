#include "step_detection.h"
#include "Gyro_QMI8658.h"

namespace StepDetection {

  void getStep() {
    float accelerationMagnitude = getAccelMagnitude();
    stepBuffer[stepBufferIndex] = accelerationMagnitude;
    stepBufferIndex = (stepBufferIndex + 1) % stepBufferLength;

    // Detect a step if the current magnitude is greater than the average of the buffer by the step threshold
    float avgMagnitude = 0;
    for (int i = 0; i < stepBufferLength; i++) {
      avgMagnitude += stepBuffer[i];
    }
    avgMagnitude /= stepBufferLength;

    // printf("%.2f %.2f\n", accelerationMagnitude, avgMagnitude);

    unsigned long currentMillis = millis();

    if (accelerationMagnitude > (avgMagnitude + stepThreshold)) {
      if (!stepDetected && (currentMillis - lastStepTime) > debounceDelay) {
        stepCount++;
        totalStepCount++;
        stepDetected = true;
        lastStepTime = currentMillis;
      }
    } else {
      stepDetected = false;
    }
  }

  int getStepCount() {
    return stepCount;
  }

  void resetStepCount() {
    stepCount = 0;
  }
}