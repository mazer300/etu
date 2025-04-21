#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#define LEN_ARR 1000

int compare(const void *x1, const void *x2){
        return (*(int*)x1-*(int*)x2);
}

int bit_search(int arr[LEN_ARR]){
        time_t start=time(NULL);
        int key=0;
        int *index_zero=(int*) bsearch(&key,arr,LEN_ARR,sizeof(int),compare);
        if(index_zero!=NULL){
                printf("exists\n");
        }else{
                printf("doesn't exist\n");
        }
        printf("%ld\n",time(NULL)-start);
}

int enumeration(int arr[LEN_ARR]){
        time_t start=time(NULL);
        int index_zero=-1;
        for(int i=0;i<LEN_ARR;i++){
                if(arr[i]==0) index_zero=i;
        }
        if(index_zero!=-1){
                printf("exists\n");
        }else{
                printf("doesn't exist\n");
        }
        printf("%ld\n",time(NULL)-start);
}

int main(){
        int *arr=malloc(LEN_ARR*sizeof(int));
        for(int i=0;i<LEN_ARR;i++){
                scanf("%d",&arr[i]);
        }
        qsort(arr,LEN_ARR,sizeof(int),compare);
        bit_search(arr);
        enumeration(arr);
        free(arr);
}
