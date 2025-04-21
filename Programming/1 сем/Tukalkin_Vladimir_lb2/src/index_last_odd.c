#include "index_last_odd.h"
int index_last_odd(int array[100]){
        int last_odd=-1;
	int i=0;
        for(i=0;i<100;i++){
                if(array[i]%2 != 0){
                        last_odd = i;
                }
        }
        if(last_odd != -1){
                return last_odd;
        }
}
