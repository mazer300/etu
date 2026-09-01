#include "FieldRenderer.h"
#include <iostream>

void FieldRenderer::render(GameField& playerField, GameField& enemyField){
    std::cout << "\nПоле игрока\n";
    printField(playerField,false);
    std::cout << "\n\nПоле противника\n";
    printField(enemyField,false);
}

void FieldRenderer::renderPlayer(GameField& playerField){
    std::cout << "Поле игрока\n";
    printField(playerField,false);
}

void FieldRenderer::print(const std::string& str){
    std::cout << str;
}

void FieldRenderer::printField(GameField& field, bool flagOpen){
    for(int i = 0; i < field.getHeight(); i++){
        for(int j = 0; j < field.getWidth(); j++){
            if(!flagOpen){
                switch(field.getState(i,j)){
                case Unknown:
                    std::cout << "⬜";
                    break;
                case Empty:
                    std::cout << "⬛";
                    break;
                case Boat:
                    std::cout << "🟥";
                    break;
                case LowBoat:
                    std::cout << "🔥";
                    break;
                case DeadBoat:
                    std::cout << "❌";
                    break;
                default:
                    break;
                }
            }else{
                std::cout << "⬜";
            }
        }
        std::cout << '\n';
    }
}