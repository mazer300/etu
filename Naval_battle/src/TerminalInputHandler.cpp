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

int TerminalInputHandler::getCommand(){
    int a;
    std::cin >> a;
    if (std::cin.fail() || !(a==1 || a==2 || a==3)) {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cout << "Некорректный ввод. Пожалуйста, введите число 1-3.\n";
        getCommand();
    }
    return a;
}


std::tuple<int, int> TerminalInputHandler::getCoords() {
    int x, y;
    std::cout << "\nВведите координаты (x y): ";
    std::cin >> x >> y;

    if (std::cin.fail()) {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cout << "Некорректный ввод. Пожалуйста, введите числа.\n";
        return getCoords();
    }

    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
        std::cout << "Координаты должны быть в пределах от 0 до 9. Попробуйте снова.\n";
        return getCoords();
    }

    return std::make_tuple(x, y);
}

std::tuple<int, int, int> TerminalInputHandler::getCoordsShip() {
    int x, y, orientation;
    std::cout << "\nВведите координаты (x y горизонтальность): ";
    std::cin >> x >> y >> orientation;

    if (std::cin.fail()) {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cout << "Некорректный ввод. Пожалуйста, введите числа.\n";
        return getCoordsShip();
    }

    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
        std::cout << "Координаты должны быть в пределах от 0 до 9. Попробуйте снова.\n";
        return getCoordsShip();
    }

    if (orientation != 0 && orientation != 1) {
        std::cout << "Ориентация должна быть 0 (вертикально) или 1 (горизонтально). Попробуйте снова.\n";
        return getCoordsShip();
    }

    return std::make_tuple(x, y, orientation);
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