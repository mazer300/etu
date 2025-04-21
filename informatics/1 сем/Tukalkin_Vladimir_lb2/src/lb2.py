import math
import numpy as np
from PIL import Image, ImageDraw, ImageOps

def pentagram(img, x0, y0, x1, y1, thickness, color):
    color=(color[0],color[1],color[2])
    ImageDraw.Draw(img).ellipse([(x0,y0),(x1,y1)],None,color,thickness)
    r=abs(x0-x1)/2
    coordinates=[]
    for i in range(5):
        phi=(np.pi/5)*(2*i+3/2)
        coordinates.append((int(x0+r+r*np.cos(phi)),int(y0+r+r*np.sin(phi))))
    for i in range(3):
        ImageDraw.Draw(img).line((coordinates[i-2],coordinates[i],coordinates[i+2]),color,thickness)
    return img

def invert(img,N,vertical):
    x,y=img.size
    if vertical==True:
        for i in range(1,math.ceil(x/N)+1,2):
            img1=img.crop((i*N,0,(i + 1)*N,y))
            img1=ImageOps.invert(img1)
            img.paste(img1,(i*N,0))
    if vertical==False:
        for i in range(1,math.ceil(y/N)+1,2):
            img1=img.crop((0,i*N,x,(i+1)*N))
            img1=ImageOps.invert(img1)
            img.paste(img1,(0,i*N))
    return img

def mix(img, rules):
    a=[]
    for i in range(len(rules)):
        a.append(rules[i])
    pieces=[]
    x,y=img.size
    for j in range(3):
        for i in range(3):
            img2=img.crop((i*x//3,j*y//3,(i+1)*x//3,(j+1)*y//3))
            pieces.append(img2)
    for i in range(9):
        img.paste(pieces[a[i]],((x//3)*(i%3),(y//3)*(i//3)))
    return img