def list_icon():
    import os
    ret = []
    for f in os.listdir('./normal'):
        if f[-4:] == '.png':
            ret.append(f[7:-4])
    return ret

def file_exist(fname):
    import os
    return os.path.isfile(fname) 

def gen_icon_css():
    icons = list_icon()
    for ico in icons:
        print('.'+ico+"icon {")
        print("  background-image: url('./normal/normal_"+ico+".png');")
        print("}")
        if file_exist('./disable/disable_'+ico+'.png'):
            print('.'+ico+"icon-disabled {")
            print("  background-image: url('./disable/disable_"+ico+".png');")
            print("}")
        if file_exist('./hover/hover_'+ico+'.png'):
            print('.'+ico+"icon:hover {")
            print("  background-image: url('./hover/hover_"+ico+".png');")
            print("}")
        if file_exist('./pressed/pressed_'+ico+'.png'):
            print('.'+ico+"icon:active {")
            print("  background-image: url('./pressed/pressed_"+ico+".png');")
            print("}")

if __name__ == '__main__':
    gen_icon_css()