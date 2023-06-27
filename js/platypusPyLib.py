from js import turn_right_js, swim_js, turn_left_js, put_down_js, pick_up_js
from js import check_is_water_js

async def turn_right():
    await turn_right_js(); 

async def turn_left():
    await turn_left_js(); 

async def swim():
    success = await swim_js()  
    if not success:
        raise Exception("Front is not clear!")

async def put_down(obj):
    success = await put_down_js(obj)
    if not success:
        raise Exception("Cannot put down object that is not held")

async def pick_up(obj):
    success = await pick_up_js(obj)
    if not success:
        raise Exception("Cannot pick up object that is not in a square")

async def front_is_clear():
    return await front_is_clear_js(); 

