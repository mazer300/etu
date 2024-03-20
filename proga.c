#include <sys/types.h>
#include <dirent.h>
#include <stdio.h>
#include <stdlib.h>

int rec(){

}

int main(){
	int answer=0;
	DIR *dir;
	struct dirent *d;
	dir=opendir("tmp");
	if(dir){
		printf("1");
		answer=rec();
	}
/*	if(!d){
		perror("opendir");
		exit(1);
	}
	while((dir = readdir(d)) != NULL) printf("%s\n", dir->d_name);
	closedir(d);
	return 0;*/
}
