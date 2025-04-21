from PIL import Image, ImageDraw


def visualization(array, GrahamArray):
    size = 0
    for i, j in array:
        size = max(size, i, j)
    size = size * 200 + 100

    img = Image.new('RGB', (size, size), 'white')
    draw = ImageDraw.Draw(img)
    prevX, prevY = GrahamArray[-1]
    for i, j in GrahamArray:
        draw.line((size // 2 + i * 100, size // 2 + j * 100, size // 2 + prevX * 100, size // 2 + prevY * 100), fill='black', width=5)
        prevX, prevY = i, j
    for i, j in array:
        draw.ellipse((size // 2 + i * 100 - 5, size // 2 + j * 100 - 5, size // 2 + i * 100 + 5, size // 2 + j * 100 + 5), fill='red')

    img.show()
