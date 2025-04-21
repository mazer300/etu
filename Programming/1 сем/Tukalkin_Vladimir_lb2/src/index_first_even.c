#include "index_first_even.h"
int index_first_even(int array[100]){
        int first_even=-1;
	int i=0;
        for(i=0;i<100;i++){
                if(array[i]%2 == 0){
                        first_even=i;
                        break;
                }
        }
        if(first_even != -1){
                return first_even;
        }
}
