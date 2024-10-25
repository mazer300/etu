#ifndef SHOOTINGABILITIES_H
#define SHOOTINGABILITIES_H

#include "Ability.h"

class ShootingAbility : public Ability{
    void apply(GameField& field, int x, int y) override;
    std::string getName() const override;
};

#endif // SHOOTINGABILITIES_H