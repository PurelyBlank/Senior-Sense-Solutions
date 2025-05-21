#pragma once

#include "LVGL_Driver.h"
#include "Display_ST77916.h"
#include "RTC_PCF85063.h"
#include "BAT_Driver.h"

static lv_obj_t* main_screen_container_obj;

static lv_obj_t* battery_obj;
static lv_obj_t* battery_tip;
static lv_obj_t *battery_level;

static lv_obj_t* timer_obj;

static lv_obj_t* heart_rate_container;
static lv_obj_t* heart_rate_obj;
static lv_obj_t* heart_rate_icon;

static lv_obj_t* step_counter_container;
static lv_obj_t* step_counter_obj;
static lv_obj_t* step_counter_icon;

static lv_style_t style_timer_large;
static lv_style_t style_biometrics_medium;

void init_styles();

void update_battery_level_display(lv_obj_t* obj); // additional parameters needed probably
void update_timer_display(lv_obj_t* obj);         // additional parameters needed probably
void update_heart_rate_display(lv_obj_t* obj);    // additional parameters needed probably
void update_step_counter_display(lv_obj_t* obj);  // additional parameters needed probably

void update_LVGL_display(double heart_rate, double battery_level, char time[64], int steps);
void LVGL_display();