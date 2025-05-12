#include "heart_rate.h"

#include <Wire.h>
#include "MAX30105.h"

#include "heartRate.h" // MAX30105.h library helper file


namespace HeartRate {

    inline constexpr byte RATE_SIZE = 4;            //Increase this for more averaging. 4 is good.
    MAX30105 particleSensor;
    byte rates[RATE_SIZE];               //Array of heart rates
    byte rateSpot = 0;
    long lastBeat = 0;                   //Time at which the last beat occurred

    float beatsPerMinute;
    int beatAvg;

    void initialize_heart_rate_sensor() {
        if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
            Serial.println("MAX30105 was not found. Please check wiring/power. ");
            while (1);
        }
        
        particleSensor.setup();                             //Configure sensor with default settings
        particleSensor.setPulseAmplitudeRed(0x0A);          //Turn Red LED to low to indicate sensor is running
        particleSensor.setPulseAmplitudeGreen(0);           //Turn off Green LED
    }

    double heart_rate() {
        long irValue = particleSensor.getIR();

        if (checkForBeat(irValue) == true) {
            long delta = millis() - lastBeat;
            lastBeat = millis();

            beatsPerMinute = 60 / (delta / 1000.0);

            if (beatsPerMinute < 255 && beatsPerMinute > 20) {
                rates[rateSpot++] = (byte)beatsPerMinute;
                rateSpot %= RATE_SIZE; //Wrap variable

                beatAvg = 0;
                for (byte x = 0 ; x < RATE_SIZE ; x++)
                    beatAvg += rates[x];
                beatAvg /= RATE_SIZE;
            }
        }

        // Serial.print("IR=");
        // Serial.print(irValue);
        // Serial.print(", BPM=");
        // Serial.print(beatsPerMinute);
        // Serial.print(", Avg BPM=");
        // Serial.print(beatAvg);

        if (irValue < 50000) {
            // Serial.print(" No finger?");
            return -1;
        }

        return beatAvg;
    }
}
