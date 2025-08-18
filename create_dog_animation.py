from PIL import Image
import os

print(f"Current directory: {os.getcwd()}")
print(f"File exists: {os.path.exists('bonbon_dog_3x3.png')}")

sprite_sheet = Image.open('bonbon_dog_3x3.png')

width, height = sprite_sheet.size
cell_width = width // 3
cell_height = height // 3

frames = []

positions = [
    (0, 1),  # left middle
    (1, 1),  # center middle
    (2, 1),  # right middle
    (0, 2),  # left bottom
    (1, 2),  # center bottom
    (2, 2),  # right bottom
]

for col, row in positions:
    left = col * cell_width
    top = row * cell_height
    right = left + cell_width
    bottom = top + cell_height
    
    frame = sprite_sheet.crop((left, top, right, bottom))
    frames.append(frame)

frames[0].save(
    'dog_running.gif',
    save_all=True,
    append_images=frames[1:],
    duration=100,
    loop=0
)

print("Created dog_running.gif successfully!")