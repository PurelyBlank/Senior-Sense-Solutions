#include "LVGL_ui.h"
#include "lv_conf.h"
#include "heart_beat.h"
#include "walk.h"
#include "RTC_PCF85063.h"
#include <lvgl.h>

lv_obj_t* main_screen_container_obj;

lv_obj_t* battery_obj;
lv_obj_t* battery_tip;
lv_obj_t *battery_level;

lv_obj_t* timer_obj;
lv_obj_t* date_obj;
lv_obj_t* day_of_week_obj;

lv_obj_t* heart_rate_container;
lv_obj_t* heart_rate_obj;
lv_obj_t* heart_rate_icon;

lv_obj_t* step_counter_container;
lv_obj_t* step_counter_obj;
lv_obj_t* step_counter_icon;

lv_style_t style_timer_large;
lv_style_t style_medium;
lv_style_t style_medium_small;

void init_styles() {
    lv_style_init(&style_timer_large);
    lv_style_set_text_font(&style_timer_large, &lv_font_montserrat_48);

    lv_style_init(&style_medium);
    lv_style_set_text_font(&style_medium, &lv_font_montserrat_28);

    lv_style_init(&style_medium_small);
    lv_style_set_text_font(&style_medium_small, &lv_font_montserrat_20); 
}

void update_battery_level_display(lv_obj_t* battery_level_obj, double battery_percentage) {
  if (battery_level_obj && battery_obj) {
    lv_coord_t battery_width = lv_obj_get_width(battery_obj);
    lv_coord_t level_width = (lv_coord_t)((battery_width * battery_percentage) / 100.0);
    lv_obj_set_width(battery_level_obj, level_width);
  }
}

void update_timer_display(lv_obj_t* obj) {
  lv_label_set_text_fmt(timer_obj, "%02d:%02d:%02d %s", get_current_hour(), get_current_minute(), get_current_second(), get_am_pm().c_str());
  lv_label_set_text_fmt(date_obj, "%s %d, %d", get_current_month_string().c_str(), get_current_day(), get_current_year());
  lv_label_set_text_fmt(day_of_week_obj, "%s", get_current_dow().c_str());
}

void update_heart_rate_display(lv_obj_t* obj, double heart_rate) {
  if (heart_rate <= 0) {
    lv_label_set_text(heart_rate_obj, "0");
  } else {
    // Serial.println("hr: " + String(heart_rate));
    lv_label_set_text_fmt(heart_rate_obj, "%s", String((int)heart_rate));
  }
}

void update_step_counter_display(lv_obj_t* obj, int steps) {
  lv_label_set_text_fmt(step_counter_obj, "%d", steps);
}

void update_screen_display(double heart_rate, double battery, int steps) {
  update_battery_level_display(battery_level, battery);
  update_timer_display(timer_obj);
  update_heart_rate_display(heart_rate_obj, heart_rate);
  update_step_counter_display(step_counter_obj, steps);
}

// initialize objects
void LVGL_display() {
  init_styles();
  lv_obj_set_style_bg_color(lv_scr_act(), LV_COLOR_MAKE(255, 255, 255), LV_STATE_DEFAULT);

  //initialize objects
  main_screen_container_obj = lv_obj_create(lv_scr_act());
  lv_obj_set_size(main_screen_container_obj, LCD_WIDTH, LCD_HEIGHT);
  lv_obj_align(main_screen_container_obj, LV_ALIGN_CENTER, 0, 0);
  lv_obj_set_scrollbar_mode(main_screen_container_obj, LV_SCROLLBAR_MODE_OFF);

  battery_obj = lv_obj_create(main_screen_container_obj);
  lv_obj_set_size(battery_obj, BATTERY_WIDTH, BATTERY_HEIGHT);
  lv_obj_set_style_radius(battery_obj, 2, 0);
  lv_obj_set_style_border_width(battery_obj, 2, 0);
  lv_obj_set_style_border_color(battery_obj, lv_color_black(), 0);
  lv_obj_set_style_bg_color(battery_obj, lv_color_white(), 0);
  lv_obj_set_style_bg_opa(battery_obj, LV_OPA_COVER, 0);
  lv_obj_set_scrollbar_mode(battery_obj, LV_SCROLLBAR_MODE_OFF);
  // lv_obj_align(battery_obj, LV_ALIGN_TOP_RIGHT, -30, 50);
  lv_obj_align(battery_obj, LV_ALIGN_CENTER, 0, -135);
  lv_obj_set_style_pad_all(battery_obj, 0, 0);
  lv_obj_set_layout(battery_obj, LV_LAYOUT_GRID);
  
  // Create the fill bar (battery level)
  battery_level = lv_obj_create(battery_obj);
  lv_obj_set_style_bg_color(battery_level, lv_palette_main(LV_PALETTE_GREEN), 0);
  lv_obj_align(battery_level, LV_ALIGN_LEFT_MID, 0, 0);
  lv_obj_set_style_bg_opa(battery_level, LV_OPA_COVER, 0);
  lv_obj_set_style_border_width(battery_level, 0, 0);
  lv_obj_set_style_pad_all(battery_level, 0, 0);

  // Create the battery tip
  battery_tip = lv_obj_create(main_screen_container_obj);
  lv_obj_set_size(battery_tip, 4, 8);
  lv_obj_set_style_bg_color(battery_tip, lv_color_black(), 0);
  lv_obj_set_style_border_width(battery_tip, 0, 0);
  lv_obj_align_to(battery_tip, battery_obj, LV_ALIGN_OUT_RIGHT_MID, 0, 0);

  // Create clock
  timer_obj = lv_label_create(main_screen_container_obj);
  lv_obj_set_style_bg_color(battery_obj, lv_color_white(), 0);
  lv_label_set_text(timer_obj, "11:59:59 AM");       // default
  lv_obj_add_style(timer_obj, &style_timer_large, 0);
  lv_obj_align(timer_obj, LV_ALIGN_CENTER, 0, -50);

  // Create date
  date_obj = lv_label_create(main_screen_container_obj);
  lv_obj_set_style_bg_color(date_obj, lv_color_white(), 0);
  lv_label_set_text(date_obj, "May 21, 2025");       // default
  lv_obj_add_style(date_obj, &style_medium, 0);
  lv_obj_align(date_obj, LV_ALIGN_CENTER, 0, -100);

  // Create day of week
  day_of_week_obj = lv_label_create(main_screen_container_obj);
  lv_obj_set_style_bg_color(day_of_week_obj, lv_color_white(), 0);
  lv_label_set_text(day_of_week_obj, "Wednesday");       // default
  lv_obj_add_style(day_of_week_obj, &style_medium_small, 0);
  lv_obj_align(day_of_week_obj, LV_ALIGN_CENTER, 0, -15);

  // Create heart rate
  heart_rate_container = lv_obj_create(main_screen_container_obj);
  lv_obj_set_size(heart_rate_container, 100, 100);
  lv_obj_set_scrollbar_mode(heart_rate_container, LV_SCROLLBAR_MODE_OFF);
  lv_obj_set_style_border_width(heart_rate_container, 0, 0);
  lv_obj_align(heart_rate_container, LV_ALIGN_BOTTOM_LEFT, 40, -60);

  heart_rate_icon = lv_img_create(heart_rate_container);
  lv_img_set_src(heart_rate_icon, &heart_beat);
  lv_obj_align(heart_rate_icon, LV_ALIGN_TOP_MID, 0, 0);

  heart_rate_obj = lv_label_create(heart_rate_container);
  lv_label_set_text(heart_rate_obj, "00");
  lv_obj_add_style(heart_rate_obj, &style_medium, 0);
  lv_obj_align(heart_rate_obj, LV_ALIGN_BOTTOM_MID, 0,  20);

  // Create step count
  step_counter_container = lv_obj_create(main_screen_container_obj);
  lv_obj_set_size(step_counter_container, 100, 100);
  lv_obj_set_scrollbar_mode(step_counter_container, LV_SCROLLBAR_MODE_OFF);
  lv_obj_set_style_border_width(step_counter_container, 0, 0);
  lv_obj_align(step_counter_container, LV_ALIGN_BOTTOM_RIGHT, -40, -60);

  step_counter_icon = lv_img_create(step_counter_container);
  lv_img_set_src(step_counter_icon, &walk);
  lv_obj_align(step_counter_icon, LV_ALIGN_TOP_MID, 0, -10);

  step_counter_obj = lv_label_create(step_counter_container);
  lv_label_set_text(step_counter_obj, "0");
  lv_obj_add_style(step_counter_obj, &style_medium, 0);
  lv_obj_align(step_counter_obj, LV_ALIGN_BOTTOM_MID, 0, 20);

}