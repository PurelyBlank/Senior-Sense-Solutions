#include "LVGL_ui.h"
#include <lvgl.h>

void LVGL_display() {
  lv_obj_set_style_bg_color(lv_scr_act(), LV_COLOR_MAKE(0, 0, 0), LV_STATE_DEFAULT);
}