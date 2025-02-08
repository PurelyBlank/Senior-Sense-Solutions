#include <TFT_eSPI.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <NTPClient.h>

// WiFi Credentials
const char* SSID = "";
const char* PASSWORD = "";

// Initialize display
TFT_eSPI tft = TFT_eSPI();

// NTP setup
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

// Display settings
const int CLOCK_TEXT_SIZE = 4;
const int CLOCK_TIME_Y_POS = 100;
const bool USE_24_HOUR = false;


void viewMacAddress() {
    WiFi.mode(WIFI_STA);
    Serial.print("MAC Address: ");
    Serial.println(WiFi.macAddress());
}

void setup() {
    Serial.begin(115200);
    
    // Initialize display
    tft.init();
    tft.setRotation(1);  // Landscape mode
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);  // Set text color with background
    tft.setTextSize(CLOCK_TEXT_SIZE);
    
    // Connect to WiFi
    Serial.printf("Connecting to %s ", SSID);
    WiFi.begin(SSID, PASSWORD);
    
    // Show connecting message on display
    tft.setTextSize(2);
    tft.drawString("Connecting to WiFi...", 10, 10);
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println(" CONNECTED");
    
    // Clear connecting message
    tft.fillScreen(TFT_BLACK);
    
    // Initialize NTP
    timeClient.begin();
    timeClient.setTimeOffset(-28800);  // PST offset
}

void displayTime(int hours, int minutes, int seconds) {
    char timeStr[9];
    char ampm[3] = "AM";
    
    if (!USE_24_HOUR) {
        if (hours == 0) {
            hours = 12;
        } else if (hours == 12) {
            strcpy(ampm, "PM");
        } else if (hours > 12) {
            hours -= 12;
            strcpy(ampm, "PM");
        }
    }
    
    sprintf(timeStr, "%02d:%02d:%02d", hours, minutes, seconds);
    
    // Calculate center position
    int textWidth = tft.textWidth(timeStr);
    int xPos = (tft.width() - textWidth) / 2;
    
    // Display time
    tft.drawString(timeStr, xPos, CLOCK_TIME_Y_POS);
    
    // Display AM/PM if in 12-hour mode
    if (!USE_24_HOUR) {
        tft.setTextSize(2);
        tft.drawString(ampm, xPos + textWidth + 10, CLOCK_TIME_Y_POS + 10);
        tft.setTextSize(CLOCK_TEXT_SIZE);
    }
    
    Serial.println(timeStr);
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        timeClient.update();
        int hours = timeClient.getHours();
        int minutes = timeClient.getMinutes();
        int seconds = timeClient.getSeconds();
        
        displayTime(hours, minutes, seconds);
    } else {
        // Try to reconnect to WiFi if disconnected
        WiFi.begin(SSID, PASSWORD);
    }
    
    delay(1000);  // Update every second
}
