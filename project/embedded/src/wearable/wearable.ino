// Project Libraries
#include "heart_rate.h"

// Library Includes
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Arduino.h>

constexpr int FAILURE   = 0;
constexpr int SUCCESS   = 1;
constexpr int ERROR     = 2;
constexpr int UNREACHED = -1;

//-----------------------------------------------------------------//
constexpr int wearable_id = 1;

//-----------------------------------------------------------------//
// For detecting increments of 1 second
unsigned long previousSecond = 0;
constexpr int milliseconds = 5000;
//-----------------------------------------------------------------//

//-----------------------------------------------------------------//
// For WiFi
constexpr char* ssid = "<YOUR_WIFI_SSID>";
constexpr char* password = "<YOUR_WIFI_PASSWORD>";

//-----------------------------------------------------------------//

//-----------------------------------------------------------------//
// For location (requires WiFi)
String payload = "";

HTTPClient http;
DynamicJsonDocument doc(1048);

String latitude = "";
String longitude = "";

constexpr char* locationURL = "http://ip-api.com/json/";
//-----------------------------------------------------------------//

//-----------------------------------------------------------------//
// For endpoint
constexpr char* serverName = "http://<IP>/<ENDPOINT>";
//-----------------------------------------------------------------//

// *IN PROGRESS...
int httpPostBiometricData(double heartRate) {  // add additional arguments as needed
    if (WiFi.status() == WL_CONNECTED) {
        http.begin(serverName);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<200> data;
        data["wearable_id"]   = wearable_id;
        data["timestamp"]     = NULL;
        data["battery_level"] = NULL;
        data["heart_rate"]    = heartRate;
        data["blood_oxyen"]   = -1;
        data["longitude"]     = longitude;
        data["latitude"]      = latitude;
        data["num_falls"]     = NULL;
        data["num_steps"]     = NULL;

        String requestBody;
        serializeJson(data, requestBody);
        int httpResponseCode = http.POST(requestBody);

        if (httpResponseCode > 0) {
            String response = http.getString();

            Serial.println(httpResponseCode);
            Serial.println(response);

            return SUCCESS;
        }
    }

    return UNREACHED;
}

void getCurrentLocation() {
    if (WiFi.status() == WL_CONNECTED) {
        http.begin(locationURL);
        int httpCode = http.GET();
        if (httpCode > 0) {
            payload = http.getString();
            deserializeJson(doc, payload);

            // update value retrieval if location API changes
            latitude=String(doc["lat"]);
            longitude=String(doc["lon"]);
        }
        http.end();
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("Initializing...");
    
    WiFi.begin(ssid, password);
    while(WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();

    delay(1000);

    // initialize all modules and sensors
    initialize_heart_rate_sensor();
}

void loop() {
    heart_rate();

    // Check if fall occured, if did, immediately send data using httpPostBiometricData()


    // Send in increments of "milliseconds"
    unsigned long currentSecond = millis();
    if (currentSecond - previousSecond >= milliseconds) {
        previousSecond = currentSecond;
        double heartRate = heart_rate();
        getCurrentLocation();

        Serial.println(heartRate);
        Serial.print(latitude.c_str());
        Serial.print(" ");
        Serial.println(longitude.c_str());

        // Send POST Request to Website Endpoint
    }
}