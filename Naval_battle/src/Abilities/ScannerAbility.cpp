#include "ScannerAbility.h"
#include <iostream>

void ScannerAbility::apply(InfoHolder& info){
    GameField &field = info.field;
    int x = info.x;
    int y = info.y;
    int height = field.getHeight();
    int width = field.getWidth();

    if(x >= width) x = width - 1;
    if(y >= height) y = height - 1;
    
    if(field.OpenCell(x, y) || field.OpenCell(x+1, y) || field.OpenCell(x+1, y+1) || field.OpenCell(x, y+1)){
        std::cout << "Ship in sector!" << '\n';
        info.flagScanner = 1;
    }
}
