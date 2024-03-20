#include <dirent.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int RecursionSolution(const char* path, const char* operation){
	int answer=0;
	if(operation && strcmp(operation,"mul")==0) answer=1;

	DIR *dir;
	struct dirent *d;
	dir=opendir(path);

	if(dir){
		printf("\nОТКРЫЛОСЬ:\n");
		while((d=readdir(dir)) != NULL){
			if(strcmp(d->d_name, ".")==0 || strcmp(d->d_name, "..")==0) continue;

			char NewPath[1024];
			snprintf(NewPath, sizeof(NewPath), "%s/%s", path, d->d_name);
			printf("путь -> %s\n",NewPath);
			if(strcmp(d->d_name,"add")==0) answer=RecursionSolution(NewPath,"add");
			if(strcmp(d->d_name,"mul")==0) answer=RecursionSolution(NewPath,"mul");

			if(strstr(d->d_name,".txt")){
					int num;
					FILE *file=fopen(NewPath,"r");
					while((fscanf(file,"%d",&num))==1){
						if(operation){
							if(strcmp(operation,"add")) answer+=num;
							if(strcmp(operation,"mul")) answer*=num;
						}
					}
				fclose(file);
			}
			printf("%s\n", d->d_name); // Вывод названия
		}
	}

	closedir(dir);
	printf("-> %d\n",answer);
	return answer;
}

int main(){
	int answer=RecursionSolution("tmp", NULL);
	FILE *FileForAnswer=fopen("result.txt","w");
	fprintf(FileForAnswer,"%d",answer);
	fclose(FileForAnswer);
}
