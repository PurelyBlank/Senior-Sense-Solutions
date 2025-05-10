// Project Libraries
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
#include "gyro.h"
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
constexpr char* ssid = "Puerta-MyCampusNet-Legacy";
constexpr char* password = "Violet-Liechtenstein-33!";

constexpr int WIFI_TIMEOUT_MS = 5000;        // 5 second WiFi connection timeout
constexpr int WIFI_RECOVER_TIME_MS = 10000;  // Wait 10 seconds after a failed connection attempt
constexpr int WIFI_STACK_SIZE = 4096;        // Increased stack size for WiFi task
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
constexpr float fallAccelThreshold = 2.5;
constexpr float fallGyroThreshold = 10;
const float stillnessThreshold = 20;   // g
constexpr int fallBufLen = 20;
float fallBufAccel[fallBufLen];
float fallBufGyro[fallBufLen];
int fallBufAccelIndex = 0;
int fallBufGyroIndex = 0;

int fallCount = 0;
bool potentialFall = false;
unsigned long fallImpactTime = 0;
const unsigned long stillWindow = 2000;  // 2 seconds


// constexpr float stepThreshold = 0.2;   // Adjust this threshold for step detection sensitivity
// constexpr int stepBufferLength = 15;  // Number of accelerometer readings in the buffer
// float stepBuffer[stepBufferLength];
// int stepBufferIndex = 0;
// int stepCount = 0;
// bool stepDetected = false;

// constexpr unsigned long debounceDelay = 500;  // Debounce delay in milliseconds
// unsigned long lastStepTime = 0;

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
    data["wearable_id"] = wearable_id;
    data["timestamp"] = NULL;
    data["battery_level"] = NULL;
    data["heart_rate"] = heartRate;
    data["blood_oxygen"] = -1;
    data["longitude"] = longitude;
    data["latitude"] = latitude;
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
    double heartRate = heart_rate();
    
    // Continuously loop to get steps
    StepDetection::getStep();
    printf("%d\n", StepDetection::stepCount);

    // Continuously monitor fall detection
    hasFallen();
    // printf("%d\n", fallCount);
    
    vTaskDelay(pdMS_TO_TICKS(100));
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
    heart_rate();

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

void getCurrentLocation() {
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
}

// void getStep() {
//   float accelerationMagnitude = getAccelMagnitude();
//   stepBuffer[stepBufferIndex] = accelerationMagnitude;
//   stepBufferIndex = (stepBufferIndex + 1) % stepBufferLength;

//   // Detect a step if the current magnitude is greater than the average of the buffer by the step threshold
//   float avgMagnitude = 0;
//   for (int i = 0; i < stepBufferLength; i++) {
//     avgMagnitude += stepBuffer[i];
//   }
//   avgMagnitude /= stepBufferLength;

//   // printf("%.2f %.2f\n", accelerationMagnitude, avgMagnitude);

//   unsigned long currentMillis = millis();

//   if (accelerationMagnitude > (avgMagnitude + stepThreshold)) {
//     if (!stepDetected && (currentMillis - lastStepTime) > debounceDelay) {
//       stepCount++;
//       stepDetected = true;
//       lastStepTime = currentMillis;
//     }
//   } else {
//     stepDetected = false;
//   }
// }

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
    vTaskDelay(500); // ensure stillness
    int totalIterations = 0;
    float totalAccelMag = 0;
    float totalGyroMag = 0;
    for (unsigned long s = millis(); millis() - s < stillWindow; ++totalIterations) {
      totalAccelMag += getAccelMagnitude();
      totalGyroMag += getGyroMagnitude();
      vTaskDelay(100);
    }
    // printf("%.2f | %.2f\n", totalAccelMag / totalIterations, totalGyroMag / totalIterations);

    if (totalGyroMag / totalIterations < stillnessThreshold) {
      ++fallCount;
    }
    potentialFall = false;
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing...");

  delay(1000);

  // initialize all modules and sensors
  initialize_heart_rate_sensor();

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