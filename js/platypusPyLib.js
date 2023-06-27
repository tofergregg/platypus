const platypusLib = `from js import turn_right_js, swim_js, turn_left_js, put_down_js, pick_up_js
from js import check_is_water_js, square_has_js, platypus_has_js

async def turn_right():
    await turn_right_js()

async def turn_left():
    await turn_left_js()

async def swim():
    success = await swim_js()  
    if not success:
        raise Exception("Front is not water!")

async def put_down(obj):
    success = await put_down_js(obj)
    if not success:
        raise Exception("Cannot put down object that is not held")

async def pick_up(obj):
    success = await pick_up_js(obj)
    if not success:
        raise Exception("Cannot pick up object that is not in a square")

async def front_is_water():
    result = await check_is_water_js('front')
    return result 

async def left_is_water():
    result = await check_is_water_js('left')
    return result 

async def right_is_water():
    result = await check_is_water_js('right')
    return result 

async def square_has(obj):
    result = await square_has_js(obj)
    return result

async def platypus_has(obj):
    result = await platypus_has_js(obj)
    return result
`
