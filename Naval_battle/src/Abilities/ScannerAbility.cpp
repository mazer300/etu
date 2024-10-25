#include "ScannerAbility.h"

void ScannerAbility::apply(GameField& field, int x, int y){
    int height = field.getBattleground().size();
    int width = field.getBattleground()[0].size();

    if(x >= width) x = width - 1;
    if(y >= height) y = height - 1;
    
    field.OpenCell(x, y);
    field.OpenCell(x+1, y);
    field.OpenCell(x+1, y+1);
    field.OpenCell(x, y+1);
}

std::string ScannerAbility::getName() const{
    return "Scanner";
}