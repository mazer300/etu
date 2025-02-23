#include "TerminalInputHandler.h"

TerminalInputHandler::TerminalInputHandler(){
    loadCommands("commands.txt");
}

Command TerminalInputHandler::getKey(){
    std::cout << "Введите ключ команды\n";
    char key;
    std::cin >> key;
    return commands[key];
}

std::tuple<int, int> TerminalInputHandler::getCoords(){
    int x,y;
    std::cout << "\nВведите координаты (x y): ";
    std::cin >> x >> y;
    std::tuple<int,int> coords(x,y);
    return coords;
}

std::tuple<int, int, int> TerminalInputHandler::getCoordsShip(){
    int x,y,orientation;
    std::cout << "\nВведите координаты (x y горизонтальность): ";
    std::cin >> x >> y >> orientation;
    std::tuple<int,int,int> coords(x,y,orientation);
    return coords;
}

void TerminalInputHandler::loadCommands(const std::string& filename){
    std::ifstream file(filename);
    if (!file.is_open()) {
        // Загрузка команд по умолчанию
        commands['s'] = Command::attack;
        commands['a'] = Command::ability;
        commands['S'] = Command::save;
        commands['L'] = Command::load;
        return;
    }

    std::string key, command;
    while (file >> key >> command) {
        if (commands.find(key[0]) != commands.end()) {
            std::cout << "Duplicate key in commands file: " <<  key << '\n';
        }
        int opt;
        std::string s1="attack";
        std::string s2="ability";
        std::string s3="save";
        std::string s4="load";
        if(s1.find(command)!=-1){
            commands[key[0]] = Command::attack;
        }else if(s2.find(command)!=-1){
            commands[key[0]] = Command::ability;
        }else if(s3.find(command)!=-1){
            commands[key[0]] = Command::save;
        }else if(s4.find(command)!=-1){
            commands[key[0]] = Command::load;
        }else{
            std::cout << "Неизвестная команда" << command << '\n';
        }
    }
}