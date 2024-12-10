#ifndef TERMINALINPUTHANDLER_H
#define TERMINALINPUTHANDLER_H

#include <iostream>
#include <unordered_map>
#include <fstream>
#include <stdexcept>
#include "GameController.h"

class TerminalInputHandler {
public:
    TerminalInputHandler();
    Command getKey();
    std::tuple<int, int> getCoords();
    std::tuple<int, int, int> getCoordsShip();

private:
    void loadCommands(const std::string& filename);
    std::unordered_map<char, Command> commands;
    //std::unordered_map<char, std::string> commands;
};

#endif // TERMINALINPUTHANDLER_H