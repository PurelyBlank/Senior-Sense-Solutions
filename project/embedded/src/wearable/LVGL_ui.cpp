#include "LVGL_ui.h"
#include "lv_conf.h"
#include "heart_beat.h"
#include "walk.h"
#include <lvgl.h>

void init_styles() {
    lv_style_init(&style_timer_large);
    lv_style_set_text_font(&style_timer_large, &lv_font_montserrat_48);

    lv_style_init(&style_biometrics_medium);
    lv_style_set_text_font(&style_biometrics_medium, &lv_font_montserrat_28);
}

void update_LVGL_display(double heart_rate, double battery_level, char time[64], int steps) {

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
  lv_obj_set_size(battery_obj, 40, 15);
  lv_obj_set_style_radius(battery_obj, 2, 0);
  lv_obj_set_style_border_width(battery_obj, 2, 0);
  lv_obj_set_style_border_color(battery_obj, lv_color_black(), 0);
  lv_obj_set_style_bg_color(battery_obj, lv_color_white(), 0);
  lv_obj_set_style_bg_opa(battery_obj, LV_OPA_COVER, 0);
  lv_obj_set_scrollbar_mode(battery_obj, LV_SCROLLBAR_MODE_OFF);
  lv_obj_align(battery_obj, LV_ALIGN_TOP_RIGHT, -30, 50);
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

  // Create heart rate
  heart_rate_container = lv_obj_create(main_screen_container_obj);
  lv_obj_set_size(heart_rate_container, 100, 100);
  lv_obj_set_scrollbar_mode(heart_rate_container, LV_SCROLLBAR_MODE_OFF);
  lv_obj_set_style_border_width(heart_rate_container, 0, 0);
  lv_obj_align(heart_rate_container, LV_ALIGN_BOTTOM_LEFT, 40, -80);

  heart_rate_icon = lv_img_create(heart_rate_container);
  lv_img_set_src(heart_rate_icon, &heart_beat);
  lv_obj_align(heart_rate_icon, LV_ALIGN_TOP_MID, 0, 0);

  heart_rate_obj = lv_label_create(heart_rate_container);
  lv_label_set_text(heart_rate_obj, "00");
  lv_obj_add_style(heart_rate_obj, &style_biometrics_medium, 0);
  lv_obj_align(heart_rate_obj, LV_ALIGN_BOTTOM_MID, 0,  20);

  // Create step count
  step_counter_container = lv_obj_create(main_screen_container_obj);
  lv_obj_set_size(step_counter_container, 100, 100);
  lv_obj_set_scrollbar_mode(step_counter_container, LV_SCROLLBAR_MODE_OFF);
  lv_obj_set_style_border_width(step_counter_container, 0, 0);
  lv_obj_align(step_counter_container, LV_ALIGN_BOTTOM_RIGHT, -40, -80);

  step_counter_icon = lv_img_create(step_counter_container);
  lv_img_set_src(step_counter_icon, &walk);
  lv_obj_align(step_counter_icon, LV_ALIGN_TOP_MID, 0, -10);

  step_counter_obj = lv_label_create(step_counter_container);
  lv_label_set_text(step_counter_obj, "0");
  lv_obj_add_style(step_counter_obj, &style_biometrics_medium, 0);
  lv_obj_align(step_counter_obj, LV_ALIGN_BOTTOM_MID, 0, 20);

}