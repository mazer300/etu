from modules.CommandHistory import CommandHistory


def test_add_command():
    history = CommandHistory(5)
    history.add_command("ls")
    history.add_command("cd /home")
    assert history.get_history() == ["ls", "cd /home"], "test_add_command failed"


def test_add_command_overflow():
    history = CommandHistory(5)
    for i in range(7):
        history.add_command(f"command{i}")
    assert history.get_history() == ["command2", "command3", "command4", "command5", "command6"], "test_add_command_overflow failed"


def test_set_max_size_increase():
    history = CommandHistory(5)
    for i in range(5):
        history.add_command(f"command{i}")
    history.set_max_size(7)
    assert history.max_size == 7, "test_set_max_size_increase failed"
    assert history.get_history() == ["command0", "command1", "command2", "command3", "command4"], "test_set_max_size_increase failed"


def test_set_max_size_decrease():
    history = CommandHistory(5)
    for i in range(5):
        history.add_command(f"command{i}")
    history.set_max_size(3)
    assert history.max_size == 3, "test_set_max_size_decrease failed"
    assert history.get_history() == ["command2", "command3", "command4"], "test_set_max_size_decrease failed"


def test_set_max_size_zero():
    history = CommandHistory(5)
    for i in range(5):
        history.add_command(f"command{i}")
    history.set_max_size(0)
    assert history.max_size == 0, "test_set_max_size_zero failed"


test_add_command()
test_add_command_overflow()
test_set_max_size_increase()
test_set_max_size_decrease()
test_set_max_size_zero()
