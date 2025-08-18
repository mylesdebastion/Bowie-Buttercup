from PIL import Image

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
    # Convert to RGBA to ensure transparency is preserved
    frame = frame.convert('RGBA')
    
    # Crop: 5% top, 6% right, 0.5% left, 7% bottom
    frame_width, frame_height = frame.size
    crop_left = int(frame_width * 0.005)
    crop_top = int(frame_height * 0.05)
    crop_right = int(frame_width * 0.06)
    crop_bottom = int(frame_height * 0.07)
    
    # Crop: (left, top, right, bottom)
    frame = frame.crop((
        crop_left,                      # crop 0.5% from left
        crop_top,                       # crop 5% from top
        frame_width - crop_right,       # crop 6% from right
        frame_height - crop_bottom      # crop 7% from bottom
    ))
    
    frames.append(frame)

# Save as GIF with disposal method to clear previous frame
frames[0].save(
    'dog_running.gif',
    save_all=True,
    append_images=frames[1:],
    duration=100,
    loop=0,
    disposal=2  # Clear frame before drawing next
)

print("Created dog_running.gif successfully!")