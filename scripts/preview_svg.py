import cairosvg
import sys

def render(svg_path, out_path, bg="#141210", scale=4):
    with open(svg_path) as f:
        svg = f.read()
    cairosvg.svg2png(bytestring=svg.encode(), write_to=out_path,
                      output_width=140*scale, output_height=140*scale,
                      background_color=bg)
    print("rendered", out_path)

if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2])
