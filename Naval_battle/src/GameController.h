#ifndef GAMECONTROLLER_H
#define GAMECONTROLLER_H

#include "Game.h"
#include <functional>
#include <unordered_map>
#include <string>

enum Command{
    attack,
    ability,
    save,
    load
};

template <typename InputHandler>
class GameController{
public:
    GameController(Game& _game, InputHandler& _inputHandler) : game(_game), inputHandler(_inputHandler) {
        /*commands['S'] = std::bind
        commands['A'] = std::bind
        commands['s'] = std::bind(&Game::saveGame, &game, "save.json");
        commands['l'] = std::bind(&Game::loadGame, &game, "save.json");*/
    }

    Interaction processInput(){
        Command key = inputHandler.getKey();
        std::tuple<int, int> coords;
        Interaction flag;
        switch (key)
        {
        case Command::attack:
            coords = inputHandler.getCoords();
            std::get<0>(coords)=check(std::get<0>(coords));
            std::get<1>(coords)=check(std::get<1>(coords));
            flag=game.playerTurn(std::get<0>(coords), std::get<1>(coords), 0);
            return flag;
            break;
        case Command::ability:
            coords = inputHandler.getCoords();
            std::get<0>(coords)=check(std::get<0>(coords));
            std::get<1>(coords)=check(std::get<1>(coords));
            flag=game.playerTurn(std::get<0>(coords), std::get<1>(coords), 1);
            if(flag == -1)  return Interaction::no_ability;
            break;
        case Command::save:
            game.saveGame("save.json");
            return Interaction::save_game;
            break;
        case Command::load:
            game.loadGame("save.json");
            return Interaction::load_game;
            break;
        default:
            break;
        }
        return Interaction::empty;
    /*
    char key = inputHandler.getKey();
    if (commands.find(key) != commands.end()) {
        commands[key]();
    }*/
    }

    bool placeShip(int indexShip){
        std::tuple<int, int, int> coords;
        std::get<0>(coords)=check(std::get<0>(coords));
        std::get<1>(coords)=check(std::get<1>(coords));
        if(std::get<2>(coords)!=0) std::get<2>(coords)=1;
        coords = inputHandler.getCoordsShip();
        bool flag=game.placeShips(indexShip, std::get<0>(coords), std::get<1>(coords), std::get<2>(coords));
        return flag;
    }

    int check(int x){
        if(x>=0 && x<10) return x;
        return 0;
    }

private:
    Game& game;
    InputHandler& inputHandler;
    //std::unordered_map<char, std::function<void()>> commands;
};

#endif // GAMECONTROLLER_H