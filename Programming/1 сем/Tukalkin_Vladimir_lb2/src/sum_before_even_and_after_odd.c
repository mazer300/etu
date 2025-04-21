#include "index_first_even.h"
#include "index_last_odd.h"
#include "sum_before_even_and_after_odd.h"
#include <stdlib.h>
int sum_before_even_and_after_odd(int array[100]){
        int sum=0, first_even = index_first_even(array), last_odd = index_last_odd(array);
	int i=0;
        for(i=0;i<first_even;i++){
                sum+= abs(array[i]);
        }
        while(last_odd < 100){
                sum+= abs(array[last_odd]);
                last_odd++;
        }
        return sum;
}
