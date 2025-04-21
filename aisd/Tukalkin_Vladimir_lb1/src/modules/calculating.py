def calculate_optimal_node_size(num):
    return (num * 4 + 63) // 64 + 1
