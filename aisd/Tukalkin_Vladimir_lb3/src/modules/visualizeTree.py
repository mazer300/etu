from PIL import Image, ImageDraw


def visualizeTree(root):
    if root is None:
        return

    h = root.height
    w = 2 ** (h - 1)

    image_width = w * 100
    image_height = h * 100
    node_radius = 20
    level_height = 80

    image = Image.new("RGB", (image_width, image_height), "white")
    draw = ImageDraw.Draw(image)

    def draw_node(node, x, y, level):
        if node is None:
            return

        draw.ellipse((x - node_radius, y - node_radius, x + node_radius, y + node_radius), outline="green",
                     fill=(118, 255, 125))
        draw.text((x - 5, y - 5), str(node.val), fill="green")

        if node.left:
            x_left = x - image_width // (2 ** (level + 2))
            y_left = y + level_height
            draw.line((x, y + node_radius, x_left, y_left - node_radius), fill="green", width=3)
            draw_node(node.left, x_left, y_left, level + 1)

        if node.right:
            x_right = x + image_width // (2 ** (level + 2))
            y_right = y + level_height
            draw.line((x, y + node_radius, x_right, y_right - node_radius), fill="green", width=3)
            draw_node(node.right, x_right, y_right, level + 1)

    draw_node(root, image_width // 2, 50, 0)
    image.save('img.png')
    image.show()
