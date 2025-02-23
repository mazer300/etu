#ifndef SHOOTINGABILITIES_H
#define SHOOTINGABILITIES_H

#include "IAbility.h"

class ShootingAbility : public IAbility{
    void apply(InfoHolder& info) override;
};

#endif // SHOOTINGABILITIES_H