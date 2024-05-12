#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>
#include <getopt.h>
#include <math.h>
#include <png.h>

#define RED "\033[1;31m"
#define RESET "\033[0m"
#define GREEN "\e[0;32m"

typedef struct{
	int width, height;
	png_byte color_type;     //{aka int}
	png_byte bit_depth;      //{aka int}
	png_structp png_ptr;     //{aka struct png_struct_def *}
	png_infop info_ptr;      //{aka struct png_info_def *}
	int number_of_passes;
	png_bytep *row_pointers; //{aka unsigned char *}
} Png;


int is_number(char* number);
int check_color_and_coordinates(char* string, int number_dot);
void print_info(Png* image);
void print_help();
void read_png_file(char* file_name, Png* image);
void write_png_file(char* file_name, Png* image);

void set_pixel(Png* image,int x,int y,int color[3]);
void function_rect(Png* image, int left_up[2], int right_down[2], int thickness, int color[3], int fill, int fill_color[3]);
void draw_ring(Png* image, int color[3], int thickness, int radius, int x0, int y0);
void draw_circle(Png* image, int color[3], int radius, int x0, int y0);
void function_ornament(Png* image, int pattern, int color[3], int thickness, int count);

void function_rotate(Png* image, int left_up[2], int right_down[2], int angle){
	if((left_up[0]>right_down[0]) || (left_up[1]>right_down[1])){
		int k1=left_up[0], k2=left_up[1];
		left_up[0]=right_down[0];
		left_up[1]=right_down[1];
		right_down[0]=k1;
		right_down[1]=k2;
	}
	if(right_down[0]>image->width || right_down[1]>image->height){
		printf("%sInvalid size image.%s\n",RED,RESET);
		exit(41);
	}

	int flag=0;
	int arr[right_down[1]-left_up[1]+1][(right_down[0]-left_up[0]+1)*3];
	if(angle==90 || angle==270){
		for(int y=0;y<right_down[1]-left_up[1]+1;y++){
			for(int x=0;x<right_down[0]-left_up[0]+1;x++){
				if(x>=0 && x<image->width && y>=0 && y<image->height && (left_up[0]+x)==abs(left_up[0]+x) && (left_up[1]+y)==abs(left_up[1]+y)){
					arr[y][x*3+0]=image->row_pointers[y+left_up[1]][(x+left_up[0])*3+0];
					arr[y][x*3+1]=image->row_pointers[y+left_up[1]][(x+left_up[0])*3+1];
					arr[y][x*3+2]=image->row_pointers[y+left_up[1]][(x+left_up[0])*3+2];
				}else{
					arr[y][x*3+0]=0;
					arr[y][x*3+1]=0;
					arr[y][x*3+2]=0;
				}
			}
		}
	}

	switch(angle){
		case 90:
			if((right_down[1]-left_up[1])%2!=0 || (right_down[0]-left_up[0])%2!=0) flag=1;
			for(int y=left_up[1];y<(right_down[0]+left_up[0])+flag;y++){
				for(int x=left_up[0];x<(right_down[1]+left_up[1]);x++){
					int xx=right_down[0]-right_down[1]+x-1;
					int yy=right_down[0]-left_up[1]-y-1;
					if(x>=0 && y>=0 && x>=left_up[0] && x<right_down[1] && y>=left_up[1] && y<right_down[0]){
						int color1[3]={arr[right_down[1]-x+left_up[1]][(y-left_up[0])*3+0], arr[right_down[1]-x+left_up[1]][(y-left_up[0])*3+1], arr[right_down[1]-x+left_up[1]][(y-left_up[0])*3+2]};
						set_pixel(image,xx,yy,color1);
					}
				}
			}
			break;
		case 180:
			if((right_down[0]-left_up[0])%2==1) flag=1;
			for(int y=left_up[1];y<right_down[1];y++){
				for(int x=left_up[0];x<(right_down[0]+left_up[0])/2;x++){
					int yy=right_down[1]+left_up[1]-y-1;
					int xx=right_down[0]+left_up[0]-x-1-flag;

					int color1[3]={0,0,0};
					int color2[3]={0,0,0};
					if(x>=0 && y>=0 && x>=left_up[0] && x<right_down[0] && y>=left_up[1] && y<right_down[1]){
						color1[0]=image->row_pointers[y][x*3+0];
						color1[1]=image->row_pointers[y][x*3+1];
						color1[2]=image->row_pointers[y][x*3+2];
					}
					if(xx>=0 && yy>=0 && xx>=left_up[0] && xx<right_down[0] && yy>=left_up[1] && yy<right_down[1]){
						color2[0]=image->row_pointers[yy][xx*3+0];
						color2[1]=image->row_pointers[yy][xx*3+1];
						color2[2]=image->row_pointers[yy][xx*3+2];
					}
					set_pixel(image,x,y,color2);
					set_pixel(image,xx,yy,color1);
				}
			}
			break;
		case 270:
			if((right_down[1]-left_up[1])%2!=0 || (right_down[0]-left_up[0])%2!=0) flag=1;
			for(int y=left_up[1];y<right_down[0];y++){
				for(int x=left_up[0];x<right_down[1];x++){
					int xx=right_down[1]+left_up[0]-x-1;
					int yy=right_down[0]+left_up[1]-y-1;
					if(x>left_up[0] && x<right_down[1] && y>=left_up[1] && y<right_down[0] && xx>=left_up[0] && yy>=left_up[1] && yy<right_down[0]){  //x>=left_up[0] +столбик справа
						//int color1[3]={arr[right_down[1]-x][(y-left_up[0])*3+0], arr[right_down[1]-x][(y-left_up[0])*3+1], arr[right_down[1]-x][(y-left_up[0])*3+2]};
						int color1[3]={arr[right_down[1]-x-left_up[1]+left_up[0]][(y-left_up[0])*3+0], arr[right_down[1]-x-left_up[1]+left_up[0]][(y-left_up[0])*3+1], arr[right_down[1]-x-left_up[1]+left_up[0]][(y-left_up[0])*3+2]};
						set_pixel(image,xx,yy,color1);
					}
				}
			}
			break;
	}
}

int main(int argc, char* argv[]){
	printf("Course work for option 4.15, created by Vladimir Tukalkin.\n");

	if(argc<2){
		print_help();
		return 0;
	}

	Png img;
	int number_function=-1;
	char input_filename[1000000];
	char output_filename[1000000];
	int parameters_ornament=0;
	int flag_print_info=0;
	int flag_left_up=0;
	int flag_right_down=0;
	int flag_input_filename=0;

	int left_up[2]={0,0};
	int right_down[2]={0,0};
	int thickness=-1;
	int color[3]={-1,-1,-1};
	int fill=0;
	int fill_color[3]={-1,-1,-1};
	int pattern=-1;
	int count=-1;
	int angle=-1;

	char* optstring="i:o:fnhrztQ:W:E:R:T:Y:U:I:";
	int option_index=0;
	struct option long_options[]={
		{"left_up",    required_argument,NULL,'Q'},
		{"right_down", required_argument,NULL,'W'},
		{"thickness",  required_argument,NULL,'E'},
		{"color",      required_argument,NULL,'R'},
		{"fill_color", required_argument,NULL,'T'},
		{"pattern",    required_argument,NULL,'Y'},
		{"count",      required_argument,NULL,'U'},
		{"angle",      required_argument,NULL,'I'},
		{"input",      required_argument,NULL,'i'},
		{"output",     required_argument,NULL,'o'},
		{"fill",     optional_argument,NULL,'f'},
		{"info",     optional_argument,NULL,'n'},
		{"help",     optional_argument,NULL,'h'},
		{"rect",     optional_argument,NULL,'r'},
		{"ornament", optional_argument,NULL,'z'},
		{"rotate",   optional_argument,NULL,'t'},
		{0,0,0,0}};
	int opt=getopt_long(argc,argv,optstring,long_options,&option_index);

	while(opt!=-1){
		switch(opt){
			case 'i':
				strcpy(input_filename,optarg);
				flag_input_filename=1;
				break;
			case 'o':
				strcpy(output_filename,optarg);
				break;
			case 'n':
				flag_print_info=1;
				break;
			case 'f':
				fill=1;
				break;
			case 'r':
				number_function=1;       //function rect
				break;
			case 'z':
				number_function=2;       //function ornament
				break;
			case 't':
				number_function=3;       //function rotate
				break;
			case 'Q':
				if(!check_color_and_coordinates(optarg,1)){
					printf("%sParameter left_up is not a number.%s\n",RED,RESET);
					return 41;
				}
				left_up[1]=atoi(strtok(optarg,"."));
				left_up[0]=left_up[1];
				left_up[1]=atoi(strtok(NULL,"."));
				flag_left_up=1;
				break;
			case 'W':
				if(!check_color_and_coordinates(optarg,1)){
					printf("%sParameter right_down is not a number.%s\n",RED,RESET);
					return 41;
				}
				right_down[1]=atoi(strtok(optarg,"."));
				right_down[0]=right_down[1];
				right_down[1]=atoi(strtok(NULL,"."));
				flag_right_down=1;
				break;
			case 'E':
				if(!is_number(optarg)){
					printf("%sParameter thickness is not a number.%s\n",RED,RESET);
					return 41;
				}
				thickness=atoi(optarg);
				break;
			case 'R':
				if(!check_color_and_coordinates(optarg,2)){
					printf("%sParameter color is not a number.%s\n",RED,RESET);
					return 41;
				}
				color[2]=atoi(strtok(optarg,"."));
				color[0]=color[2];
				color[2]=atoi(strtok(NULL,"."));
				color[1]=color[2];
				color[2]=atoi(strtok(NULL,"."));
				if(color[0]>255 || color[1]>255 || color[2]>255){
					printf("%sParameter color has [0-255].%s\n",RED,RESET);
					return 41;
				}
				parameters_ornament+=1;
				break;
			case 'T':
				if(!check_color_and_coordinates(optarg,2)){
					printf("%sParameter fill_color is not a number.%s\n",RED,RESET);
					return 41;
				}
				fill_color[2]=atoi(strtok(optarg,"."));
				fill_color[0]=fill_color[2];
				fill_color[2]=atoi(strtok(NULL,"."));
				fill_color[1]=fill_color[2];
				fill_color[2]=atoi(strtok(NULL,"."));
				if(fill_color[0]>255 || fill_color[1]>255 || fill_color[2]>255){
					printf("%sParameter fill_color has [0-255].%s\n",RED,RESET);
					return 41;
				}
				break;
			case 'Y':
				if(strcmp(optarg,"rectangle")==0){
					pattern=1;
				}else if(strcmp(optarg,"circle")==0){
					pattern=2;
				}else if(strcmp(optarg,"semicircles")==0){
					pattern=3;
				}else{
					printf("%sParameter pattern is incorrect.%s\n",RED,RESET);
				}
				parameters_ornament+=1;
				break;
			case 'U':
				if(!is_number(optarg) || atoi(optarg)<0){
					printf("%sParameter count is incorrect.%s\n",RED,RESET);
					return 41;
				}
				count=atoi(optarg);
				parameters_ornament+=1;
				break;
			case 'I':
				if(atoi(optarg)==90 || atoi(optarg)==180 || atoi(optarg)==270){
					angle=atoi(optarg);
					break;
				}else{
					printf("%sParameter angle is incorrect.%s\n",RED,RESET);
					return 41;
				}
			case 'h':
				print_help();
				return 0;
			case '?':
				printf("%sArguments entered incorrectly.%s\n",RED,RESET);
				return 41;
			default:
				break;
		}
		opt=getopt_long(argc,argv,optstring,long_options,&option_index);
	}

	if(strlen(output_filename)==0){
		printf("%sMissing output filename.\n%s",RED,RESET);
	}

	if(flag_input_filename==0) strcpy(input_filename,argv[argc-1]);
	read_png_file(input_filename, &img);

	if(flag_print_info==1){
		print_info(&img);
		return 0;
	}

	switch (number_function){
		case 1:
			if(flag_left_up==1 && flag_right_down==1 && color[0]!=-1 && thickness!=-1){
				if((fill==1 && fill_color[0]==-1) || (fill==0 && fill_color[0]!=-1)){
					printf("%sMissing parameter for fill.%s\n",RED,RESET);
					return 42;
				}
				function_rect(&img,left_up,right_down,thickness,color,fill,fill_color);
				break;
			}else{
				printf("%sThere are not enough parameters for the function rect.%s\n",RED,RESET);
				return 42;
			}
		case 2:
			if(parameters_ornament>=2){
				if(pattern==2 && color[0]!=-1){
					function_ornament(&img,pattern,color,0,0);
					break;
				}
				if(pattern!=2 && pattern!=-1 && color[0]!=-1 && thickness!=-1 && count!=-1){
					function_ornament(&img,pattern,color,thickness,count);
					break;
				}
				printf("%sThere are not enough parameters for the function ornament.%s\n",RED,RESET);
				break;
			}else{
				printf("%sThere are not enough parameters for the function ornament.%s\n",RED,RESET);
				return 42;
			}
		case 3:
			if(angle!=-1 && flag_left_up==1 && flag_right_down==1){
				function_rotate(&img,left_up,right_down,angle);
				break;
			}else{
				printf("%sThere are not enough parameters for the function rotate.%s\n",RED,RESET);
				return 42;
			}
		default:
			printf("%sIncorrectly function name.%s\n",RED,RESET);
			return 43;
	}

	if(strlen(output_filename)!=0){
		write_png_file(output_filename,&img);
	}
	printf("%sDONE%s\n",GREEN,RESET);
	return 0;
}

int is_number(char* number){
	for(size_t i=0;i<strlen(number);i++){
		if(!isdigit(number[i])){
			return 0;
		}
	}
	return 1;
}

int check_color_and_coordinates(char* string, int number_dot){
	int count_dot=0;
	int len=0;
	for(size_t i=0;i<strlen(string);i++){
		if(isdigit(string[i]) || (string[i]=='-' && number_dot==1)){
			len++;
		}else if(string[i]=='.' && count_dot<number_dot){
			len++;
			count_dot++;
		}
	}
	if(count_dot==2){
		int k=0;
		for(size_t i=0;i<len;i++){
			if(string[i]=='.'){
				k+=1;
			}else{
				k=0;
			}
			if(k==2){
				printf("%sIncorrect color or fill_color.%s\n",RED,RESET);
				exit(41);
			}
		}
	}
	if(len==strlen(string) && count_dot==number_dot) return 1;
	return 0;
}

void print_info(Png* image){
	printf("---Info---\n");
	printf("Width: %d\n", image->width);
    	printf("Height: %d\n", image->height);
    	printf("Bit Depth: %d\n", image->bit_depth);
    	printf("Number of passes: %d\n", image->number_of_passes);
}

void print_help(){
	FILE* file=fopen("help.txt","r");
	if(!file){
		printf("%sFile help.txt not found.%s\n",RED,RESET);
		exit(40);
	}
	char symbol=(char) fgetc(file);
	while(symbol!=EOF){
		printf("%c",symbol);
		symbol=(char) fgetc(file);
	}
	fclose(file);
}

void read_png_file(char* file_name, Png* image){
	unsigned char header[8];
	/* Открыть и проверить, что файл png */
	FILE *fp = fopen(file_name, "rb");
	if(!fp){
		if(strlen(file_name)!=0){
			printf("%sCannot read file: %s%s\n",RED,file_name,RESET);
			exit(40);
		}else{
			printf("%sCannot read file.%s\n",RED,RESET);
			exit(40);
		}
	}
	fread(header, 1, 8, fp);
	if(png_sig_cmp(header, 0, 8)!=0){
		printf("%sProbably, %s is not a png.%s\n",RED,file_name,RESET);
		exit(40);
	}

	/* Инициализация структуры PNG */
	image->png_ptr = png_create_read_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
	if(!image->png_ptr){
	// Блок исполнится при ошибке в структуре PNG
		printf("%sError in png structure.%s\n",RED,RESET);
		exit(40);
	}
	image->info_ptr = png_create_info_struct(image->png_ptr);
	if(!image->info_ptr){
		printf("%sError in png info-structure.%s\n",RED,RESET);
		exit(40);
	}
	if(setjmp(png_jmpbuf(image->png_ptr))){
		printf("%sError during init_io.%s\n",RED,RESET);
		exit(40);
	}
	png_init_io(image->png_ptr, fp);
	png_set_sig_bytes(image->png_ptr, 8);
	png_read_info(image->png_ptr, image->info_ptr);
	image->width = png_get_image_width(image->png_ptr, image->info_ptr);
	image->height = png_get_image_height(image->png_ptr, image->info_ptr);
	image->color_type = png_get_color_type(image->png_ptr,image->info_ptr);
	image->bit_depth = png_get_bit_depth(image->png_ptr, image->info_ptr);
	image->number_of_passes = png_set_interlace_handling(image->png_ptr);

	/* Проверка типа PNG */
	if(image->color_type==PNG_COLOR_TYPE_RGBA){
		printf("%sThe program does not support working with the PNG_COLOR_TYPE_RGBA color type.%s\n",RED,RESET);
		exit(40);
	}else if(image->color_type==PNG_COLOR_TYPE_GRAY){
		printf("%sThe program does not support working with the PNG_COLOR_TYPE_GRAY color type.%s\n",RED,RESET);
        	exit(40);
	}else if(image->color_type==PNG_COLOR_TYPE_GRAY_ALPHA){
		printf("%sThe program does not support working with the PNG_COLOR_TYPE_GRAY_ALPHA color type.%s\n",RED,RESET);
		exit(40);
	}else if(image->color_type==PNG_COLOR_TYPE_PALETTE){
		printf("%sThe program does not support working with the PNG_COLOR_TYPE_PALETTE color type.%s\n",RED,RESET);
		exit(40);
	}
	png_read_update_info(image->png_ptr, image->info_ptr);

	/* чтение файла */
	image->row_pointers = (png_bytep *) malloc(sizeof(png_bytep)* image->height);
	for(int y=0;y<image->height;y++){
		image->row_pointers[y]=(png_byte*)malloc(png_get_rowbytes(image->png_ptr,image->info_ptr));
	}
	png_read_image(image->png_ptr, image->row_pointers);
	fclose(fp);
}

void write_png_file(char* file_name, Png* image){
	/* создание файла */
	FILE* fp=fopen(file_name, "wb");
	if(!fp){
		printf("%sError in write_png_file function: file could not opened.%s\n",RED,RESET);
		exit(40);
	}

	/* Инициализация структуры */
	image->png_ptr=png_create_write_struct(PNG_LIBPNG_VER_STRING,NULL,NULL,NULL);
	if(!image->png_ptr){
		printf("%sError in write_png_file function: png_create_write_struct failed.%s\n",RED,RESET);
		exit(40);
	}
	image->info_ptr=png_create_info_struct(image->png_ptr);
	if(!image->info_ptr){
		printf("%sError in write_png_file function: png_create_info_struct failed.%s\n",RED,RESET);
		exit(40);
	}
	if(setjmp(png_jmpbuf(image->png_ptr))){
		printf("%sError in write_png_file function: error during init_io.%s\n",RED,RESET);
		exit(40);
	}
	png_init_io(image->png_ptr,fp);

	/* Запись заголовка */
	if(setjmp(png_jmpbuf(image->png_ptr))){
		printf("%sError in write_png_file function: error during writing header.%s\n",RED,RESET);
		exit(40);
	}
	png_set_IHDR(image->png_ptr, image->info_ptr, image->width, image->height, image->bit_depth, image->color_type, PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_BASE, PNG_FILTER_TYPE_BASE);
	png_write_info(image->png_ptr, image->info_ptr);

	if(setjmp(png_jmpbuf(image->png_ptr))){
		printf("%sError in write_png_file function: error during writing bytes.%s\n",RED,RESET);
		exit(40);
	}
	png_write_image(image->png_ptr, image->row_pointers);

	/* Конец записи */
	if(setjmp(png_jmpbuf(image->png_ptr))){
		printf("%sError in write_png_file function: error during writing end of file.%s\n",RED,RESET);
		exit(40);
	}
	png_write_end(image->png_ptr, NULL);

	/* Очистка памяти */
	for(int y = 0; y < image->height; y++) free(image->row_pointers[y]);
	free(image->row_pointers);
	fclose(fp);
}

void set_pixel(Png* image,int x,int y,int color[3]){
	if(x>=0 && y>=0 && x<image->width && y<image->height){
		image->row_pointers[y][x*3+0]=color[0]; //Red
		image->row_pointers[y][x*3+1]=color[1]; //Green
		image->row_pointers[y][x*3+2]=color[2]; //Blue
	}
}

void function_rect(Png* image, int left_up[2], int right_down[2], int thickness, int color[3], int fill, int fill_color[3]){
	/* Сhecking the correctness of coordinates */
	if((left_up[0]>right_down[0]) || (left_up[1]>right_down[1])){
		int k1=left_up[0], k2=left_up[1];
		left_up[0]=right_down[0];
		left_up[1]=right_down[1];
		right_down[0]=k1;
		right_down[1]=k2;
	}
	/* Draw up */
	for(int y=left_up[1];y<left_up[1]+thickness;y++){
		for(int x=left_up[0];x<right_down[0];x++){
			set_pixel(image,x,y,color);
		}
	}
	/* Draw left */
	for(int y=left_up[1];y<right_down[1];y++){
		for(int x=left_up[0];x<left_up[0]+thickness;x++){
			set_pixel(image,x,y,color);
		}
	}
	/* Draw down */
	for(int y=right_down[1]-thickness;y<right_down[1];y++){
		for(int x=left_up[0];x<right_down[0];x++){
			set_pixel(image,x,y,color);
		}
	}
	/* Draw right */
	for(int y=left_up[1];y<right_down[1];y++){
		for(int x=right_down[0]-thickness;x<right_down[0];x++){
			set_pixel(image,x,y,color);
		}
	}
	/* Fill */
	if(fill==1){
		for(int y=left_up[1]+thickness;y<right_down[1]-thickness;y++){
			for(int x=left_up[0]+thickness;x<right_down[0]-thickness;x++){
				set_pixel(image,x,y,fill_color);
			}
		}
	}
}

void draw_ring(Png* image, int color[3], int thickness, int radius, int x0, int y0){
	thickness=thickness/2;
	for(int y=y0-radius-2*thickness;y<y0+radius+2*thickness;y++){
		for(int x=x0-radius-2*thickness;x<x0+radius+2*thickness;x++){
				if(((radius)*(radius)-2*thickness*radius-2)<((x-x0)*(x-x0)+(y-y0)*(y-y0)) && ((thickness+radius)*(thickness+radius))>((x-x0)*(x-x0)+(y-y0)*(y-y0))){
					set_pixel(image,x,y,color);
			}
		}
	}
}

void draw_circle(Png* image, int color[3], int radius, int x0, int y0){
	for(int y=y0-radius;y<y0+radius;y++){
		for(int x=x0-radius;x<x0+radius;x++){
				if(((radius)*(radius))>((x-x0)*(x-x0)+(y-y0)*(y-y0))){
					set_pixel(image,x,y,color);
			}
		}
	}
}

void function_ornament(Png* image, int pattern, int color[3], int thickness, int count){
	int width=image->width/count/2+1;
	int height=image->height/count/2+1;
	int radius=image->width/2;
	if(radius>image->height/2) radius=image->height/2;
	switch(pattern){
		case 1:
			if(thickness>image->width) thickness=image->width/2;
			if(thickness>image->height) thickness=image->height/2;
			if(thickness*4*count>image->width) count=1+image->width/thickness/4;
			if(thickness*4*count>image->height) count=1+image->height/thickness/4;
			for(size_t i=0;i<count;i++){
				int left_up[2]={0+i*2*thickness,0+i*2*thickness};
				int right_down[2]={image->width-i*2*thickness,image->height-i*2*thickness};
				function_rect(image,left_up,right_down,thickness,color,0,NULL);
			}
			break;
		case 2:
			for(size_t y=image->height/2;y<image->height;y++){
				for(size_t x=image->width/2;x<image->width;x++){
					if((radius*radius)<((x-image->width/2)*(x-image->width/2)+(y-image->height/2)*(y-image->height/2))){
						set_pixel(image,x,y,color); //right down
						set_pixel(image,image->width-x-1,image->height-y-1,color); //left up
						set_pixel(image,image->width-x-1,y,color); //left_down
						set_pixel(image,x,image->height-y-1,color); //right_up
					}
				}
			}
			break;
		case 3:
			for(size_t i=0;i<count;i++){
				draw_ring(image,color,thickness,width,width+i*2*width,0);
				draw_ring(image,color,thickness,width,width+i*2*width,image->height);
			}
			for(size_t i=0;i<count;i++){
				draw_ring(image,color,thickness,height,0,height+2*i*height);
				draw_ring(image,color,thickness,height,image->width,height+2*i*height);
			}
			break;
		default:
			printf("КАК ТЫ СЮДА ПОПАЛ?!\n");
			break;
	}
}
