#include <stdio.h>
#include <string.h>
#include <regex.h>

int main(){
	char text[10000];
	char *pattern="([a-zA-Z0-9_]+)@[a-zA-Z0-9_-]+: ?~ ?# (.+)";
	regex_t regex;
	size_t max_group=3;
	regmatch_t groupArray[max_group];
	regcomp(&regex,pattern,REG_EXTENDED);
	
	while(1){
		fgets(text,10000,stdin);
		if(strstr(text,"Fin.")!=NULL) break;
		if(regexec(&regex,text,max_group,groupArray,0)==0){
			for(int j=1;j<max_group;j++){
					for(int i=groupArray[j].rm_so;i<groupArray[j].rm_eo;i++) printf("%c",(char)text[i]);
					if(j==1) printf(" - ");
			}
		}
	}
	regfree(&regex);
	return 0;
}
