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

`swim()`: swims the platypus in the direction it is facing. The 
