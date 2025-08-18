from PIL import Image
import numpy as np

sprite_sheet = Image.open('bonbon_dog_3x3.png')

width, height = sprite_sheet.size
cell_width = width // 3
cell_height = height // 3

frames = []
eye_positions = []

positions = [
    (0, 1),  # left middle
    (1, 1),  # center middle
    (2, 1),  # right middle
    (0, 2),  # left bottom
    (1, 2),  # center bottom
    (2, 2),  # right bottom
]

# Extract frames and find eye position in each
for col, row in positions:
    left = col * cell_width
    top = row * cell_height
    right = left + cell_width
    bottom = top + cell_height
    
    frame = sprite_sheet.crop((left, top, right, bottom))
    frame = frame.convert('RGBA')
    
    # Convert to numpy array to find white pixels (the eye)
    arr = np.array(frame)
    
    # Look for white or near-white pixels (R>250, G>250, B>250)
    # The dog's left eye (viewer's right) should be white
    white_mask = (arr[:,:,0] > 250) & (arr[:,:,1] > 250) & (arr[:,:,2] > 250) & (arr[:,:,3] > 0)
    
    # Find all white pixel coordinates
    white_coords = np.argwhere(white_mask)
    
    if len(white_coords) > 0:
        # Get the leftmost white pixel cluster (dog's left eye from viewer's perspective)
        # Sort by x coordinate and take the leftmost cluster
        sorted_coords = white_coords[white_coords[:,1].argsort()]
        
        # Take the average position of the leftmost white pixels
        eye_cluster = sorted_coords[:min(5, len(sorted_coords))]  # Take first few white pixels
        eye_y = int(np.mean(eye_cluster[:, 0]))
        eye_x = int(np.mean(eye_cluster[:, 1]))
        
        print(f"Frame {len(frames)}: Eye position at ({eye_x}, {eye_y})")
        eye_positions.append((eye_x, eye_y))
    else:
        print(f"Frame {len(frames)}: No eye detected, using center estimate")
        # Estimate based on typical position if no white pixel found
        eye_positions.append((cell_width // 3, cell_height // 3))
    
    frames.append(frame)

# Find the reference position (use first frame's eye position)
if eye_positions:
    ref_x, ref_y = eye_positions[0]
    print(f"\nReference eye position: ({ref_x}, {ref_y})")
    
    # Calculate maximum canvas size needed
    max_offset_left = max(0, max(ref_x - ex for ex, ey in eye_positions))
    max_offset_right = max(0, max(ex - ref_x for ex, ey in eye_positions))
    max_offset_top = max(0, max(ref_y - ey for ex, ey in eye_positions))
    max_offset_bottom = max(0, max(ey - ref_y for ex, ey in eye_positions))
    
    # Create canvas size that can accommodate all aligned frames
    canvas_width = cell_width + max_offset_left + max_offset_right
    canvas_height = cell_height + max_offset_top + max_offset_bottom
    
    print(f"Canvas size: {canvas_width}x{canvas_height}")
    
    aligned_frames = []
    
    # Define jump arc - up for first half, down for second half
    jump_heights = [0, -10, -15, -15, -10, 0]  # Negative values move up
    
    for i, (frame, (eye_x, eye_y)) in enumerate(zip(frames, eye_positions)):
        # Create a new transparent canvas
        canvas = Image.new('RGBA', (canvas_width, canvas_height), (0, 0, 0, 0))
        
        # Calculate offset to align eye to reference position
        offset_x = max_offset_left + (ref_x - eye_x)
        offset_y = max_offset_top + (ref_y - eye_y) + jump_heights[i]  # Add jump offset
        
        print(f"Frame {i}: Offset ({offset_x}, {offset_y}) with jump offset {jump_heights[i]}")
        
        # Paste frame at calculated offset
        canvas.paste(frame, (offset_x, offset_y), frame)
        aligned_frames.append(canvas)
    
    # Crop 5% from all sides
    cropped_frames = []
    for frame in aligned_frames:
        frame_width, frame_height = frame.size
        crop_amount = int(min(frame_width, frame_height) * 0.05)
        
        cropped = frame.crop((
            crop_amount,                    # 5% from left
            crop_amount,                    # 5% from top
            frame_width - crop_amount,      # 5% from right
            frame_height - crop_amount      # 5% from bottom
        ))
        cropped_frames.append(cropped)
    
    aligned_frames = cropped_frames
    
    # Save as GIF
    aligned_frames[0].save(
        'dog_running_aligned.gif',
        save_all=True,
        append_images=aligned_frames[1:],
        duration=100,
        loop=0,
        disposal=2
    )
    
    print("\nCreated dog_running_aligned.gif with eye alignment!")
else:
    print("Could not detect eye positions")