#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

int process_directory(const char *path, const char *operation);

int main() {
	int result = process_directory("tmp", NULL);
	FILE *output = fopen("result.txt", "w");
	fprintf(output, "%d\n", result);
	fclose(output);
	return 0;
}

int process_directory(const char *path, const char *operation) {
	if (!dir) {
		perror("opendir");
		exit(1);
	}

	struct dirent *entry;
	int result = (operation && strcmp(operation, "mul") == 0) ? 1 : 0;

	while ((entry = readdir(dir)) != NULL) {
		if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
			continue;
		}

		char subpath[1024];
		snprintf(subpath, sizeof(subpath), "%s/%s", path, entry->d_name);

		struct stat st;
		if (stat(subpath, &st) == -1) {
			perror("stat");
			exit(1);
		}

		if (S_ISDIR(st.st_mode)) {
			int subdir_result = process_directory(subpath, entry->d_name);
			if (operation) {
				if (strcmp(operation, "add") == 0) {
					result += subdir_result;
				} else if (strcmp(operation, "mul") == 0) {
					result *= subdir_result;
				}
			} else {
				result = subdir_result;
			}
		} else if (S_ISREG(st.st_mode) && strstr(entry->d_name, ".txt")) {
			FILE *file = fopen(subpath, "r");
			if (!file) {
				perror("fopen");
				exit(1);
			}

			int number;
			while (fscanf(file, "%d", &number) == 1) {
				if (operation) {
					if (strcmp(operation, "add") == 0) {
						result += number;
					} else if (strcmp(operation, "mul") == 0) {
						result *= number;
					}
				} else {
					result = number;
				}
			}

			fclose(file);
		}
	}

	closedir(dir);
	return result;
}