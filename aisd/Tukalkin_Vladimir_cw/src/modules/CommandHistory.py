class CommandHistory:
    def __init__(self, max_size=10):
        self.max_size = max_size
        self.commands = []

    def add_command(self, command):
        if len(self.commands) >= self.max_size:
            self.commands.pop(0)  # Удаляем самую старую команду
        self.commands.append(command)

    def set_max_size(self, new_size):
        if new_size < 0:
            raise ValueError("Размер не может быть отрицательным")
        self.max_size = new_size
        self.trim_history()

    def trim_history(self):
        if len(self.commands) > self.max_size:
            self.commands = self.commands[-self.max_size:]

    def get_history(self):
        return self.commands

    def __str__(self):
        return "\n".join(self.commands)


    def get_command(self,index):
        return self.commands[index]