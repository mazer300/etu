#ifndef FIELDRENDERER_H
#define FIELDRENDERER_H

#include "GameField.h"
#include <string>

class FieldRenderer{
public:
    void render(GameField& playerField, GameField& enemyField);
    void renderPlayer(GameField& playerField);
    void print(const std::string& str);
};

#endif // FIELDRENDERER_H