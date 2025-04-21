#include "index_first_even.h"
#include "index_last_odd.h"
#include "sum_between_even_odd.h"
#include <stdlib.h>
int sum_between_even_odd(int array[100]){
        int sum=0, first_even = index_first_even(array), last_odd=index_last_odd(array);
        while(first_even < last_odd){
                sum +=abs(array[first_even]);
                first_even++;
        }
        return sum;
}
