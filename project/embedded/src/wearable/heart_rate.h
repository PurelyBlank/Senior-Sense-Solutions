#pragma once

#include <Wire.h>
#include "MAX30105.h"

#include "heartRate.h" // MAX30105.h library helper file

namespace HeartRate {
    void initialize_heart_rate_sensor();
    double heart_rate();
}