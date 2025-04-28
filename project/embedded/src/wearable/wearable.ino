// Project Libraries
#include "heart_rate.h"

// Library Includes
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// STL Libraries
#include <unordered_map>

//-----------------------------------------------------------------//
// For detecting increments of 1 second
unsigned long previousSecond = 0;
constexpr int oneSecond = 1000;
//-----------------------------------------------------------------//

//-----------------------------------------------------------------//
// For WiFi
const char* ssid = "REPLACE_WITH_YOUR_SSID";
const char* password = "REPLACE_WITH_YOUR_PASSWORD";
//-----------------------------------------------------------------//

//-----------------------------------------------------------------//
// For location (requires WiFi)
String payload = "";

HTTPClient http;
DynamicJsonDocument doc(1024);

String locationURL = "https://ipapi.co/json/";
//-----------------------------------------------------------------//

//-----------------------------------------------------------------//
// For endpoint
String serverName = "http://<IP>/<ENDPOINT>";
//-----------------------------------------------------------------//


std::unordered_map<std::string, std::string> getCurrentLocation() {
    std::unordered_map<std::string, std::string> locationMapping;

    if ((WiFi.status() == WL_CONNECTED)) {
        http.begin(locationURL);
        int httpCode = http.GET();
        if (httpCode > 0) {
            payload = http.getString();
            DeserializationError error = deserializeJson(doc, payload);

            if (!error) {
                for (JsonPair kv : doc.as<JsonObject>()) {
                    String key = kv.key().c_str();
                    
                    if (kv.value().is<std::string>()) {
                        locationMapping[key.c_str()] = kv.value().as<std::string>();
                    } else if (kv.value().is<const char*>()) {
                        locationMapping[key.c_str()] = std::string(kv.value().as<const char*>());
                    } else if (kv.value().is<bool>()) {
                        locationMapping[key.c_str()] = kv.value().as<bool>() ? "true" : "false";
                    } else if (kv.value().is<int>() || kv.value().is<long>()) {
                        locationMapping[key.c_str()] = std::to_string(kv.value().as<long>());
                    } else if (kv.value().is<float>() || kv.value().is<double>()) {
                        locationMapping[key.c_str()] = std::to_string(kv.value().as<float>());
                    } else {
                        // Handle other types if needed
                        locationMapping[key.c_str()] = "Unsupported type";
                    }
                }
            }
        }
        http.end(); // Free the resources
    }
    return locationMapping;
}

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

      // Send POST Request to Website Endpoint
    }
}