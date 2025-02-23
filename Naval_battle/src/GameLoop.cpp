#include "GameLoop.h"
#include <cstdlib>

GameLoop::GameLoop() {}


void GameLoop::startGame(){
    std::system("clear");
    Game game;
    TerminalInputHandler inputHandler;
    FieldRenderer fieldRenderer;

    GameController<TerminalInputHandler> gameController(game, inputHandler);
    GameRenderer<FieldRenderer> gameRenderer(game, fieldRenderer);

    gameRenderer.print("Введите число \n1 = Новая игра \n2 = Новая игра со случайной расстановкой \n3 = Загрузить сохранение\n");
    
    int a=-1;
    game.startGame();
    while(1){
        std::cin >> a;
        if(a == 3){
            game.loadGame("save.json");
            break;
        }else if(a == 2){
            game.autoplaceShipsPlayer();
            break;
        }else if(a==1){
            std::system("clear");
            for(int i=0; i<10;i++){
                bool flag=false;
                while(!flag){
                    flag=gameController.placeShip(i);
                    if(!flag) gameRenderer.print("Некорректное расположение корабля\n");
                    gameRenderer.renderPlayer();
                }
            }
            break;
        }else{
            gameRenderer.print("Введите корректный аргумент\n");
            std::cin >> a;
        }
    }
    std::system("clear");

    Interaction command;
    while (1) {
        gameRenderer.print("\nКоличество способностей: ");
        gameRenderer.print(std::to_string(game.getAbilities()));
        if(game.checkGameOver()) break;
        gameRenderer.render();
        command=gameController.processInput();
        std::system("clear");

        switch(command){
            case Interaction::no_ability:
                gameRenderer.print("Способности закончились, будет заменено на атаку\n");
                break;
            case Interaction::miss:
                gameRenderer.print("\n\033[3;42;30mПромах!\033[0m\n");
                break;
            case Interaction::shoot_ship:
                gameRenderer.print("\n\033[3;42;30mПопадание!\033[0m\n");
                break;
            case Interaction::destroy_ship:
                gameRenderer.print("\n\033[3;42;30mКорабль уничтожен!\033[0m\n");
                break;
            case Interaction::save_game:
                continue;
            case Interaction::load_game:
                continue;
        }
        game.startRound();
    }
}

/*
Надо сделать:
фикс атаки по кораблю после загрузки

*/