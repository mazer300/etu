#ifndef SCANNERABILITIES_H
#define SCANNERABILITIES_H

#include "Ability.h"

class ScannerAbility : public Ability{
    void apply(GameField& field, int x, int y) override;
    std::string getName() const override;
};

#endif // SCANNERABILITIES_H