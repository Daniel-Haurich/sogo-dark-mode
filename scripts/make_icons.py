from PIL import Image, ImageDraw

sizes = [16, 32, 48, 128]

bg_top = (52, 44, 110)      # dark violet-blue
bg_bottom = (26, 22, 58)    # near black
moon_color = (255, 209, 102)  # warm yellow

for size in sizes:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Vertical gradient used as the circle background
    grad = Image.new("L", (1, size), color=0)
    for y in range(size):
        t = y / max(size - 1, 1)
        grad.putpixel((0, y), int(255 * t))
    grad = grad.resize((size, size))

    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    top = Image.new("RGBA", (size, size), bg_top + (255,))
    bottom = Image.new("RGBA", (size, size), bg_bottom + (255,))
    bg = Image.composite(bottom, top, grad)

    mask = Image.new("L", (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    pad = max(1, size // 16)
    mdraw.ellipse([pad, pad, size - pad, size - pad], fill=255)

    circle = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    circle.paste(bg, (0, 0), mask)

    # Moon (circle minus an offset circle)
    moon_layer = Image.new("L", (size, size), 0)
    mdraw2 = ImageDraw.Draw(moon_layer)
    r = size * 0.34
    cx, cy = size * 0.46, size * 0.5
    mdraw2.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    cut_r = size * 0.30
    ccx, ccy = cx + size * 0.16, cy - size * 0.10
    mdraw2.ellipse([ccx - cut_r, ccy - cut_r, ccx + cut_r, ccy + cut_r], fill=0)

    moon_img = Image.new("RGBA", (size, size), moon_color + (255,))
    circle.paste(moon_img, (0, 0), moon_layer)

    circle.save(f"icons/icon{size}.png")

print("done")
