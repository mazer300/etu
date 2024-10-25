#ifndef OUTOFFIELDATTACKEXCEPTIONS_H
#define OUTOFFIELDATTACKEXCEPTIONS_H

#include <stdexcept>

class OutOfFieldAttackExceptions : public std::runtime_error{
public:
    OutOfFieldAttackExceptions() : std::runtime_error("Attack out of field") {}
};

#endif // OUTOFFIELDATTACKEXCEPTIONS_H