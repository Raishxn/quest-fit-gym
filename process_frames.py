import os
import glob
from PIL import Image, ImageDraw

source_dir = r"C:\Users\Erick\.gemini\antigravity\brain\b977a4c5-1524-4d8e-bc3a-d75dc4e613ab"
dest_dir = r"c:\Users\Erick\Documents\GitHub\quest-fit-gym\public\frames"

# Mapping of keywords to standard names
mappings = {
    "gold": "gold.png",
    "diamond": "diamond.png",
    "fire": "fire.png",
    "crown": "crown.png",
    "lightning": "lightning.png",
    "star": "star.png",
    "dragon": "dragon.png"
}

for keyword, out_name in mappings.items():
    pattern = os.path.join(source_dir, f"frame_{keyword}_*.png")
    matches = glob.glob(pattern)
    if not matches:
        print(f"Skipping {keyword}, file not found")
        continue
    
    img_path = matches[-1] # take the latest
    img = Image.open(img_path).convert("RGBA")
    
    # AI images are usually 1024x1024
    width, height = img.size
    
    # We want to carve out a perfect circle in the center.
    # The frame edge is usually around the center. Let's make a mask.
    # Center = width/2, height/2. 
    # Radius of inner cutout = width * 0.35 (70% of the image size)
    
    mask = Image.new("L", img.size, 255)
    draw = ImageDraw.Draw(mask)
    
    cx, cy = width // 2, height // 2
    r_inner = int(width * 0.15)
    
    # Draw a black circle in the center of the mask (black = transparent in our final step)
    draw.ellipse((cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner), fill=0)
    
    # Apply the mask to the alpha channel
    # Note: If the AI already made the outside transparent, we don't want to make it opaque.
    # We take the existing alpha and MIN it with our mask.
    r, g, b, a = img.split()
    
    from PIL import ImageChops
    new_alpha = ImageChops.darker(a, mask)
    
    img.putalpha(new_alpha)
    
    # Resize to 256x256
    img = img.resize((256, 256), Image.Resampling.LANCZOS)
    
    out_path = os.path.join(dest_dir, out_name)
    img.save(out_path)
    print(f"Saved {out_path}")

