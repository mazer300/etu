#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int end(int str){
	if(strchr(".;?!",str)) return 1;
	return 0;
}

int main(){
	char **string=malloc(sizeof(char*));
	int start_len=0, end_len=0;
	while(1){
		char *extra_string=malloc(sizeof(char));
		char symbol=1;
		int len=0;
		while(!end(symbol)){
			symbol=getchar();
			extra_string[len++]=symbol;
			extra_string=realloc(extra_string, sizeof(char)*(len+1));
		}
		extra_string[len]='\0';
		start_len++;
		if(strchr(extra_string,'?')==NULL){
			if(strchr(" \t", extra_string[0])){
				if(extra_string[1]=='\n'){
					memmove(extra_string, extra_string+1, strlen(extra_string));
				}else{
					extra_string[0]='\n';
				}
			}
			string[end_len++]=extra_string;
			string=realloc(string, sizeof(char*)*(end_len+1));
		}
		if (strstr(extra_string, "Dragon flew away!")) break;
	}
	for(int i=0;i<end_len;i++){
		printf("%s",string[i]);
		free(string[i]);
	}
	printf("\nКоличество предложений до %d и количество предложений после %d", start_len - 1, end_len - 1);
	free(string);
}
