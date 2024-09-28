cmake_minimum_required(VERSION 3.10)

project(NavalBattle)

set(CMAKE_CXX_STANDARD 11)

add_executable(NavalBattle
    main.cpp
    Ship.cpp
    ShipManager.cpp
    GameField.cpp
)

target_include_directories(NavalBattle PUBLIC ${CMAKE_SOURCE_DIR})