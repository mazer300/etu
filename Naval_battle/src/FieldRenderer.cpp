#include "FieldRenderer.h"
#include <iostream>

void FieldRenderer::render(GameField& playerField, GameField& enemyField){
    std::cout << "\nПоле игрока\n";
    playerField.printField(false);
    std::cout << "\n\nПоле противника\n";
    enemyField.printField(false);
}

void FieldRenderer::renderPlayer(GameField& playerField){
    std::cout << "Поле игрока\n";
    playerField.printField(false);
}

void FieldRenderer::print(const std::string& str){
    std::cout << str;
}