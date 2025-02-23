#ifndef NOABILITYEXCEPTIONS_H
#define NOABILITYEXCEPTIONS_H

#include <stdexcept>

class NoAbilityExceptions : public std::runtime_error{
public:
    NoAbilityExceptions() : std::runtime_error("No abilities") {}
};

#endif // NOABILITYEXCEPTIONS_H