#include "GameLoop.h"
#include "TerminalInputHandler.h"
#include "FieldRenderer.h"

int main() {
    TerminalInputHandler inputHandler;
    FieldRenderer renderer;
    GameLoop<TerminalInputHandler, FieldRenderer> game(inputHandler, renderer);
    game.startGame();
    return 0;
}