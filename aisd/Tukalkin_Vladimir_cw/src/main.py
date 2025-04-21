from modules.CommandHistory import CommandHistory
import keyboard

current_command_index = -1

def on_key_up(command_history):
    global current_command_index
    if len(command_history.commands) > 0 and current_command_index < len(command_history.commands) - 1:
        current_command_index += 1
        return command_history.commands[current_command_index]
    return ""

def on_key_down(command_history):
    global current_command_index
    if current_command_index > 0:
        current_command_index -= 1
        return command_history.commands[current_command_index]
    return ""

if __name__ == "__main__":
    commandHistory = CommandHistory(100)

    while True:

        command = input()

        if command == "print_history":
            print("\nХранимые команды:")
            print(commandHistory)
            print(">>>", commandHistory.get_command(1))
            continue

        elif command.split()[0] == "set_size":
            commandHistory.set_max_size(int(command.split()[1]))
            continue

        elif command == "break_program_history":
            break

        else:
            commandHistory.add_command(command)
            current_command_index =-1


            try:
                while True:
                    key_event = keyboard.read_event()
                    if key_event.event_type == "down":
                        if key_event.name == "up":
                            result = on_key_up(commandHistory)
                            if result:
                                print(f"\r{result}")
                        elif key_event.name == "down":
                            result = on_key_down(commandHistory)
                            if result:
                                print(f"\r{result}")
            except KeyboardInterrupt:
                break