#ifndef GAMERENDERER_H
#define GAMERENDERER_H

#include "Game.h"

template <typename Renderer>
class GameRenderer {
public:
    GameRenderer(Game& _game, Renderer& _renderer) : game(_game), renderer(_renderer) {}
    void render() {
        renderer.render(game.getPlayerField(), game.getEnemyField());
    }
    void renderPlayer(){
        renderer.renderPlayer(game.getPlayerField());
    }
    void print(const std::string& str){
        renderer.print(str);
    }

private:
    Game& game;
    Renderer& renderer;
};

#endif // GAMERENDERER_H