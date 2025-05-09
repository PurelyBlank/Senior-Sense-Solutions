// Project Libraries
#include "fall_detection.h"
#include "heart_rate.h"
#include "step_detection.h"

// Library Includes
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Arduino.h>

#include "BAT_driver.h"
#include "I2C_Driver.h"
#include "Gyro_QMI8658.h"
#include "RTC_PCF85063.h"


constexpr int FAILURE = 0;
constexpr int SUCCESS = 1;
constexpr int ERROR = 2;
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
constexpr char* ssid = "<SSID>";
constexpr char* password = "<PASSWORD>";

constexpr int WIFI_TIMEOUT_MS = 5000;        // 5 second WiFi connection timeout
constexpr int WIFI_RECOVER_TIME_MS = 10000;  // Wait 10 seconds after a failed connection attempt
constexpr int WIFI_STACK_SIZE = 4096;        // Increased stack size for WiFi task
//-----------------------------------------------------------------//

//-----------------------------------------------------------------//
// // For location (requires WiFi)
HTTPClient http;

String payload = "";
DynamicJsonDocument doc(1048);

constexpr char* locationURL = "http://ip-api.com/json/";
//-----------------------------------------------------------------//

//-----------------------------------------------------------------//
// For endpoint
constexpr char* serverName = "http://<IP>/<ENDPOINT>";
//-----------------------------------------------------------------//

std::pair<String, String> getCurrentLocation() {
  String latitude = "";
  String longitude = "";

  if (WiFi.status() == WL_CONNECTED) {
    http.begin(locationURL);
    int httpCode = http.GET();
    if (httpCode > 0) {
      payload = http.getString();
      deserializeJson(doc, payload);

      // update value retrieval if location API changes
      latitude = String(doc["lat"]);
      longitude = String(doc["lon"]);
    }
    http.end();
  }
  return std::make_pair(latitude, longitude);
}

// *IN PROGRESS...
int httpPostBiometricData(double heartRate) {  // add additional arguments as needed
  if (WiFi.status() == WL_CONNECTED) {
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> data;
    data["wearable_id"] = wearable_id;
    data["timestamp"] = NULL;
    data["battery_level"] = NULL;
    data["heart_rate"] = NULL;
    data["blood_oxygen"] = -1;
    data["longitude"] = NULL;
    data["latitude"] = NULL;
    data["num_falls"] = NULL;
    data["num_steps"] = NULL;

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

// WiFi task with improved error handling
void keepWiFiAlive(void* parameter) {
  // Give other tasks time to initialize first
  vTaskDelay(2000 / portTICK_PERIOD_MS);

  printf("WiFi task started\n");

  // Initialize WiFi in station mode
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);

  for (;;) {
    if (WiFi.status() == WL_CONNECTED) {
      // Already connected - check again in 10 seconds
      vTaskDelay(10000 / portTICK_PERIOD_MS);
      continue;
    }

    // Not connected - try to connect
    printf("[WIFI] Connecting to %s\n", ssid);
    WiFi.begin(ssid, password);

    // Track connection attempt timing
    unsigned long startAttemptTime = millis();

    // Wait for connection with timeout
    while (WiFi.status() != WL_CONNECTED && (millis() - startAttemptTime < WIFI_TIMEOUT_MS)) {
      // Print a dot every 500ms
      printf(".");
      vTaskDelay(500 / portTICK_PERIOD_MS);
    }

    // Check if we're connected
    if (WiFi.status() == WL_CONNECTED) {
      printf("\n[WIFI] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
      // Get location after successful connection
      vTaskDelay(2000 / portTICK_PERIOD_MS);  // Wait for WiFi to stabilize
    } else {
      // Connection failed
      printf("\n[WIFI] Connection failed after %d ms\n", WIFI_TIMEOUT_MS);
      WiFi.disconnect(true);  // Disconnect and clear credentials
      vTaskDelay(WIFI_RECOVER_TIME_MS / portTICK_PERIOD_MS);
    }
  }
}


void retrieveBiometricData(void* parameter) {
  while (1) {
    // Get heart rate
    double heartRate = HeartRate::heart_rate();
    // printf("%.2lf\n", heartRate);

    // Continuously loop to get steps
    StepDetection::getStep();
    // printf("%d\n", StepDetection::stepCount);

    // Continuously monitor fall detection
    FallDetection::hasFallen();
    // printf("%d\n", FallDetection::fallCount);
  }
  // unsigned long currentSecond = millis();
  // if (currentSecond - previousSecond >= milliseconds) {
  //     previousSecond = currentSecond;
  //     double heartRate = heart_rate();
  //     getCurrentLocation();

  //     Serial.println(heartRate);
  //     Serial.print(latitude.c_str());
  //     Serial.print(" ");
  //     Serial.println(longitude.c_str());

  //     // Send POST Request to Website Endpoint
  // }
}

void DriverTask(void *parameter) {
  while(1){    
    // Own sensors
    HeartRate::heart_rate();

    // Other sensors
    // PWR_Loop();
    BAT_Get_Volts();
    RTC_Loop();
    QMI8658_Loop(); 
    // Psram_Inquiry();
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void Driver_Loop() {
  // Create WiFi task on core 1 (usually safer for network tasks)
  BaseType_t wifiTaskCreated = xTaskCreatePinnedToCore(
    keepWiFiAlive,
    "WiFiTask",
    WIFI_STACK_SIZE,
    NULL,
    4,
    NULL,
    1
  );

  // Wait a bit for the system to stabilize
  vTaskDelay(500 / portTICK_PERIOD_MS);

  if (wifiTaskCreated != pdPASS) {
    printf("Failed to create WiFi task! Error code: %d\n", wifiTaskCreated);
  }

  xTaskCreatePinnedToCore(
    DriverTask,
    "DriverTask",
    4096,
    NULL,
    3,
    NULL,
    0
  );

  vTaskDelay(500 / portTICK_PERIOD_MS);

  // Create loop to get data
  xTaskCreatePinnedToCore(
    retrieveBiometricData,
    "retrieveBiometricData",
    4096,
    NULL,
    3,
    NULL,
    0
  );

}

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing...");

  delay(1000);

  // initialize all modules and sensors
  HeartRate::initialize_heart_rate_sensor();

  // initialize others
  BAT_Init();
  I2C_Init();
  QMI8658_Init();
  // calibrateGyroscope();  // Run this once
  PCF85063_Init();
  printf("Gyro Calibration Complete\n");

  // Start background tasks after everything is initialized
  printf("Starting system tasks...\n");
  Driver_Loop();
}

void loop() {
}