#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#define RED "\033[1;31m"
#define RESET "\033[0m"

void error_writer(int error_number);
void function_0(char* text[], int count_sentences);
void function_number_1(char* text[], int count_sentences);
void function_number_2(char* text[], int count_sentences);
void function_number_3(char* text[], int count_sentences);
void function_number_4(char* text[], int count_sentences);
void reference();
void function_number_8(char* text[], int count_sentences, int num);

int main(){
	printf("Course work for option 4.2, created by Vladimir Tukalkin.\n");
	char command_number;
	scanf("%s",&command_number);
	if(strchr("0123458",command_number)==NULL){
		error_writer(0);
	}
	if(command_number=='5') reference();

	int number_8;
	if(command_number=='8'){
		scanf("%d",&number_8);
	}

	if(strchr("012348",command_number)){
		char **text=malloc(sizeof(char*));
		int count_sentences=0;
		int flag_mark=0;                    //check "!" and "?"

		while(1){													//start of text reading
			char *sentence=malloc(sizeof(char));
			char symbol=1;
			int len_sentence=0;
			int count_n=0;                   //check EOF
			int flag_space=0;                //check extra space
			int flag_dot=0;                  //check space before dot

			while(strchr(".!?",(int)symbol)==NULL){
				symbol=getchar();    //reading

				if(strchr("?!",(int)symbol)!=NULL){   //check "!" and "?"
					error_writer(1); //
					flag_mark=1;     //
					break;           //
				}                        //check "!" and "?"

				if(symbol=='\n'){        	//check \n
					count_n++;       	//
					if(count_n==2){		//
						symbol='\n';    //
					}else{			//
						symbol=' ';     //
					}			//
				}else{                   	//
					count_n=0;       	//
				}                        	//check \n

				if(strchr(" \t",symbol)!=NULL){       //check extra space
					flag_space++;		      //
					symbol=' ';		      //
				}else{                                //
					flag_space=0;                 //
				}                                     //
				if(flag_space>1) continue;            //check extra space

				if(symbol==' '){                                                            //check space before dot
					flag_dot++;				                            //
				}if(strchr("., ",symbol)==NULL){		                            //
					flag_dot=0;				                            //
				}						                            //
				if((symbol=='.' || symbol==',') && flag_dot>0){                             //
					sentence[len_sentence-1]=symbol;	                            //
					flag_dot=0;				                            //
					if(symbol==','){                                                    //
						sentence[len_sentence++]=' ';                               //
						sentence=realloc(sentence,sizeof(char)*(len_sentence+1));   //
					}                                                                   //
					flag_space++;                                                       //
					continue;				                            //
				}						                            //check space before dot

				if(strchr(".,",symbol)!=NULL){                                                 //space after comma
					sentence[len_sentence++]=symbol;                                       //
					sentence=realloc(sentence,sizeof(char)*(len_sentence+1));              //
					if(symbol==','){                                                       //
						sentence[len_sentence++]=' ';                                  //
						sentence=realloc(sentence,sizeof(char)*(len_sentence+1));      //
						flag_space++;                                                  //
					}                                                                      //
					continue;                                                              //
				}                                                                              //space after comma

				if(flag_space<2){
					sentence[len_sentence++]=symbol;
					sentence=realloc(sentence,sizeof(char)*(len_sentence+1));
				}

				if(count_n==2){                                                      //EOF
					symbol='.';                                                  //
					sentence[len_sentence++]=symbol;                             //
					sentence=realloc(sentence,sizeof(char)*(len_sentence));      //
				}                                                                    //EOF
			}

			if(flag_mark==1) break;

			if(strstr(sentence,"\n.")) break;    //EOF
			sentence[len_sentence-1]='\0';

			if(strchr(" ",sentence[0])) memmove(sentence,sentence+1,strlen(sentence));

			if(strlen(sentence)!=1 && strchr(" \t",sentence[0])==NULL){         //writing sentence in text
				text[count_sentences++]=sentence;                           //
				text=realloc(text,sizeof(char*)*(count_sentences+1));       //
			}                                                                   //writing sentence in text
		}														//end of text reading

		for(int number_str1=0;number_str1<count_sentences-1;number_str1++){                                             //start of compare sentence
			for(int number_str2=1;number_str2<count_sentences;number_str2++){
				if(strlen(text[number_str1])==strlen(text[number_str2]) && number_str1!=number_str2){
					int count_sameness=0;
					for(int i=0;i<strlen(text[number_str1]);i++){
							if(tolower(text[number_str1][i])==tolower(text[number_str2][i])){
								count_sameness++;
							}else{
								count_sameness=0;
								break;
							}
							if(count_sameness==strlen(text[number_str1])){
								char* str=malloc(sizeof(char));
								str[0]=' ';
								text[number_str2]=realloc(text[number_str2],sizeof(char));
								text[number_str2]=str;
							}
					}
				}
			}
		}                                                                                                               //end of compare sentence

		if(flag_mark==0){
			switch (command_number){
				case '0':
					function_0(text, count_sentences);
					break;
				case '1':
					function_number_1(text, count_sentences);
					break;
				case '2':
					function_number_2(text, count_sentences);
					break;
				case '3':
					function_number_3(text, count_sentences);
					break;
				case '4':
					function_number_4(text, count_sentences);
					break;
				case '8':
					function_number_8(text, count_sentences, number_8);
					break;
			}
		}

		for(int i=0;i<count_sentences;i++) free(text[i]);     //clean memory
		free(text);

	}
}

void error_writer(int error_number){          //writing error
        switch (error_number){
                case 0:
                        printf("\n%sError: invalid command number%s\n",RED,RESET);
                        break;
                case 1:
                        printf("\n%sError: '!' or '?' at the end of the sentence%s\n",RED,RESET);
                        break;
        }
}

void function_0(char* text[], int count_sentences){
	for(int i=0;i<count_sentences;i++) printf("%s.\n",text[i]);
}

void function_number_1(char* text[], int count_sentences){
	for(int i=0;i<count_sentences;i++){
		int flag_start=0;
		int count_num=0;
		for(int j=0;j<strlen(text[i]);j++){
			char* symbol=malloc(sizeof(char));
			strncpy(symbol,text[i]+j,1);
			if(strchr("qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM",*symbol)==NULL) count_num++;//writing of the first capital letter and other sentence
			if(strchr("qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM",*symbol)==NULL && flag_start==0){
				continue;
			}else{
				if(j-count_num==0){
					printf("%c",toupper(*symbol));
				}else{
					printf("%c",tolower(*symbol));
				}
			flag_start=1;
			free(symbol);
			}
		}
		printf(".\n");
	}
}

void function_number_2(char* text[], int count_sentences){
	for(int i=0;i<count_sentences;i++){
		if(strstr(text[i],"2018")==NULL) printf("%s.\n",text[i]);
	}
}

int comparator(const void* x1, const void* x2){
	const char **str1=(const char **)x1;
	const char **str2=(const char **)x2;
	int count1=0, count2=0;
	if(strstr(*str1,"0")==NULL && strstr(*str1,"1")==NULL && strstr(*str1,"2")==NULL && strstr(*str1,"3")==NULL && strstr(*str1,"4")==NULL && strstr(*str1,"5")==NULL && strstr(*str1,"6")==NULL && strstr(*str1,"7")==NULL && strstr(*str1,"8")==NULL && strstr(*str1,"9")==NULL) return -1;
	if(strstr(*str2,"0")==NULL && strstr(*str2,"1")==NULL && strstr(*str2,"2")==NULL && strstr(*str2,"3")==NULL && strstr(*str2,"4")==NULL && strstr(*str2,"5")==NULL && strstr(*str2,"6")==NULL && strstr(*str2,"7")==NULL && strstr(*str2,"8")==NULL && strstr(*str2,"9")==NULL) return 1;
	else{
		for(int i=0;i<strlen(*str1);i++){
			char symbol;
			strncpy(&symbol,&(*str1)[i],1);
			if(strchr("1234567890",symbol)!=NULL) count1=count1+atoi(&symbol);
		}
		for(int i=0;i<strlen(*str2);i++){
			char symbol;
			strncpy(&symbol,&(*str2)[i],1);
			if(strchr("1234567890",symbol)!=NULL) count2=count2+atoi(&symbol);
		}
		return count2-count1;
	}
}

void function_number_3(char* text[], int count_sentences){
	qsort(text,count_sentences,sizeof(char*),comparator);
	for(int i=0;i<count_sentences;i++) printf("%s.\n",text[i]);
}

void function_number_4(char* text[], int count_sentences){
	for(int i=0;i<count_sentences;i++){
		if(strstr(text[i],"0")!=NULL && strstr(text[i],"1")!=NULL && strstr(text[i],"2")!=NULL && strstr(text[i],"3")!=NULL && strstr(text[i],"4")!=NULL && strstr(text[i],"5")!=NULL && strstr(text[i],"6")!=NULL && strstr(text[i],"7")!=NULL && strstr(text[i],"8")!=NULL && strstr(text[i],"9")!=NULL) printf("%s.\n",text[i]);
	}
}

void reference(){
	printf("Reference:\n0-text output after the initial mandatory processing\n1-convert sentences so that each word in it starts with a capital letter, and the remaining characters of the word are lowercase\n2-Delete all offers that contain the number 2018\n3-sort the sentences by increasing the sum of the digits found in the sentence. If there are no digits in the sentence, then the sum of the digits of this sentence is infinity\n4-display all sentences in which all numbers occur at least once\n");
}

void function_number_8(char* text[], int count_sentences, int num){
	for(int i=0;i<count_sentences;i++){
		for(int j=0;j<num-1;j++) printf("%s ",text[i]);
	printf("%s.\n",text[i]);
	}
}
