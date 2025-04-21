#include <stdio.h>
#include "index_first_even.h"
#include "index_last_odd.h"
#include "sum_between_even_odd.h"
#include "sum_before_even_and_after_odd.h"
int main(){
        int first=0;
        int i=0;
        scanf("%d",&first);
        char ch;
        int array[100];
        for(i = 0;(ch=getchar()) != '\n'; i++){
                scanf("%d",&array[i]);
        }
        for(;i<100;i++){
                array[i] = 0;
        }
        switch (first){
                case 0:
                        printf("%d\n",index_first_even(array));
                        break;
                case 1:
                        printf("%d\n",index_last_odd(array));
                        break;
                case 2:
                        printf("%d\n",sum_between_even_odd(array));
                        break;
                case 3:
                        printf("%d\n",sum_before_even_and_after_odd(array));
                        break;
                default:
                        printf("Данные некорректны\n");
                        break;
        }

}
