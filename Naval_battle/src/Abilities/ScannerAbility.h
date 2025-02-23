#ifndef SCANNERABILITIES_H
#define SCANNERABILITIES_H

#include "IAbility.h"

class ScannerAbility : public IAbility{
    void apply(InfoHolder& info) override;
};

#endif // SCANNERABILITIES_H