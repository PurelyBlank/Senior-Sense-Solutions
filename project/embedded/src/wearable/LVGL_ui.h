#pragma once

#include "LVGL_Driver.h"
#include "Display_ST77916.h"
#include "RTC_PCF85063.h"
#include "BAT_Driver.h"

constexpr int BATTERY_WIDTH{ 40 };
constexpr int BATTERY_HEIGHT{ 15 };

extern lv_obj_t* main_screen_container_obj;

extern lv_obj_t* battery_obj;
extern lv_obj_t* battery_tip;
extern lv_obj_t* battery_level;

extern lv_obj_t* timer_obj;
extern lv_obj_t* date_obj;
extern lv_obj_t* day_of_week_obj;

extern lv_obj_t* heart_rate_container;
extern lv_obj_t* heart_rate_obj;
extern lv_obj_t* heart_rate_icon;

extern lv_obj_t* step_counter_container;
extern lv_obj_t* step_counter_obj;
extern lv_obj_t* step_counter_icon;

extern lv_style_t style_timer_large;
extern lv_style_t style_medium;
extern lv_style_t style_medium_small;

void init_styles();

void update_battery_level_display(lv_obj_t* obj, double battery_level);
void update_timer_display(lv_obj_t* obj);
void update_heart_rate_display(lv_obj_t* obj, double heart_rate);
void update_step_counter_display(lv_obj_t* obj, int steps);

void update_screen_display(double heart_rate, double battery_level, int steps);
void LVGL_display();
