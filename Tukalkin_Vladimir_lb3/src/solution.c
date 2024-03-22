#include <dirent.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int RecursionSolution(const char* path, const char* operation){
	long long int answer=0;
	if(operation && strcmp(operation,"mul")==0) answer=1;

	DIR *dir;            //Открытие директории
	struct dirent *d;
	dir=opendir(path);

	if(dir){
		while((d=readdir(dir)) != NULL){
			if(strcmp(d->d_name, ".")==0 || strcmp(d->d_name, "..")==0) continue;  //Исключение . и ..

			char NewPath[1024];     //Создание нового пути
			snprintf(NewPath, sizeof(NewPath), "%s/%s", path, d->d_name);

			if(strstr(d->d_name,".txt")){   //Если файл
					long long int num;
					FILE *file=fopen(NewPath,"r");
					while(fscanf(file,"%lld",&num)==1){
						if(operation){
							if(strcmp(operation,"add")==0){
								answer+=num;
							}else if(strcmp(operation,"mul")==0){
								answer*=num;
							}
						}
					}
				fclose(file);
			}else{                 //Если папка
				long long int num=RecursionSolution(NewPath,d->d_name);
				if(operation){
					if(strcmp(operation,"add")==0){
						answer+=num;
					}else if(strcmp(operation,"mul")==0){
						answer*=num;
					}
				}else{
					answer=num;   //Присваивание ответа для tmp
				}
			}
		}
	}

	closedir(dir);
	return answer;
}

int main(){
	long long int answer=RecursionSolution("tmp", NULL);
	FILE *FileForAnswer=fopen("result.txt","w");
	fprintf(FileForAnswer,"%lld",answer);
	fclose(FileForAnswer);
}
