# Platypus TODO:

1. List objects the platypus is holding on screen
2. Illegal commands should have an error message (e.g., front is not clear when hitting land or going out of bounds)
3. Add starter code to world definitions (probably better to have a world creator tool that exports a JS class PlatypusWorld object in JSON)
4. Examples and exercises
5. Clean up code
6. Add count for objects, e.g., `how_many('egg')` returns the number of eggs the platypus is holding.
7. Add `all_items_held()` which returns a `dict`, e.g., `{'egg': 4, 'crab': 1}`
8. Add `front_is_water()`, `left_is_water()`, `right_is_water()`
9. Add `facing_north()`, `facing_south()`, `facing_east()`, `facing_west()`

# Platypus commands:

### Basic commands: 
`turn_right()`: turns the platypus clockwise.
`turn_left()`: turns the platypus counterclockwise.
`swim()`: swims the platypus in the direction it is facing. The front must be water, not land or out of bounds.
`pick_up(object)`: picks up the object (`'crab'` or `'egg'`). There must be at least one of that object on that grid space.
`put_down(object)`: puts down the object (`'crab'` or `'egg'`). The platypus must have at least one of that object.

### Conditions:
`is_front_water()`: boolean, `True` if the front is water, `False` if the front is land or out of bounds. 
`is_left_water()`: boolean, `True` if the square to the left of the direction the platypus is facing is water, `False` if the left is land or out of bounds. 
`is_right_water()`: boolean, `True` if the square to the right of the direction the platypus is facing is water, `False` if the right is land or out of bounds. 
`facing(direction)`: boolean, `True` if the platypus is facing the direction (`'E'`, `'S'`, `'W'`, or `'N'`).
`square_has(obj)`: boolean, `True` if the square has the object (`'crab'` or `'egg'`), `False` otherwise.
`platypus_has(obj)`: boolean, `True` if the platypus has the object (`'crab'` or `'egg'`), `False` otherwise.



