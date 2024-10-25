#ifndef INVALIDPLACEMENTSHIPEXCEPTIONS_H
#define INVALIDPLACEMENTSHIPEXCEPTIONS_H

#include <stdexcept>

class InvalidPlacementShipExceptions : public std::runtime_error{
public:
    InvalidPlacementShipExceptions() : std::runtime_error("Invalid placement ship") {}
};

#endif // INVALIDPLACEMENTSHIPEXCEPTIONS_H