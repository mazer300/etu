cmake_minimum_required(VERSION 3.10)

project(NavalBattle)

set(CMAKE_CXX_STANDARD 17)

#aux_source_directory(./src tree)

add_executable(NavalBattle
    main.cpp
    Ship.cpp
    ShipManager.cpp
    GameField.cpp
    AbilityManager.cpp
    ./Abilities/ShootingAbility.cpp
    ./Abilities/ScannerAbility.cpp
    ./Abilities/DoubleDamageAbility.cpp
    

)

target_include_directories(NavalBattle PUBLIC ${CMAKE_SOURCE_DIR})