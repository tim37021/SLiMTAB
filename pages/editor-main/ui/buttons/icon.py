def list_icon():
    import os
    ret = []
    for f in os.listdir('./normal'):
        if f[-4:] == '.png':
            ret.append(f[7:-4])
    return ret

def gen_icon_css():
    icons = list_icon()
    for ico in icons:
        print('.'+ico+"icon {")
        print("  background-image: url('./normal/normal_"+ico+".png');")
        print("}")
        print('.'+ico+"icon-disabled {")
        print("  background-image: url('./disable/disable_"+ico+".png');")
        print("}")
        print('.'+ico+"icon:hover {")
        print("  background-image: url('./hover/hover_"+ico+".png');")
        print("}")
        print('.'+ico+"icon:active {")
        print("  background-image: url('./pressed/pressed_"+ico+".png');")
        print("}")

if __name__ == '__main__':
    gen_icon_css()