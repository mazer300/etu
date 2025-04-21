#include <stdio.h>
#include <stdlib.h>

int index_first_even(int array[100]){
        int first_even=-1;
        for(int i=0;i<100;i++){
                if(array[i]%2 == 0){
                        first_even=i;
                        break;
                }
        }
        if(first_even != -1){
                return first_even;
        }
}

int index_last_odd(int array[100]){
        int last_odd=-1;
        for(int i=0;i<100;i++){
                if(array[i]%2 != 0){
                        last_odd = i;
                }
        }
        if(last_odd != -1){
                return last_odd;
        }
}

int sum_between_even_odd(int array[100]){
        int sum=0, first_even = index_first_even(array), last_odd=index_last_odd(array);
        while(first_even < last_odd){
                sum +=abs(array[first_even]);
                first_even++;
        }
        return sum;
}

int sum_before_even_and_after_odd(int array[100]){
        int sum=0, first_even = index_first_even(array), last_odd = index_last_odd(array);
        for(int i=0;i<first_even;i++){
                sum+= abs(array[i]);
        }
        while(last_odd < 100){
                sum+= abs(array[last_odd]);
                last_odd++;
        }
        return sum;
}

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
