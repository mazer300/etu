import numpy as np

def check_collision(bot1, bot2):
    if np.linalg.matrix_rank([bot1,bot2])==2:
        left_side=np.array([bot1[:2],bot2[:2]])
        right_side=np.array([bot1[2:]*-1,bot2[2:]*-1])
        matrix_final=np.linalg.inv(left_side).dot(right_side)
        return round(matrix_final[0][0],2),round(matrix_final[1][0],2)
    else: return 'None'

def check_surface(point1, point2, point3):
    if np.linalg.matrix_rank([point1, point2, point3])==3:
        left_side=np.array([[point1[0],point1[1],1], [point2[0],point2[1],1], [point3[0],point3[1],1]])
        right_side=np.array([point1[2],point2[2],point3[2]])
        return np.round(np.linalg.solve(left_side,right_side),2)
    else: return 'None'

def check_rotation(vec, rad):
    matrix_rotation=np.transpose(np.array([[np.cos(rad), -1*np.sin(rad)], [np.sin(rad), np.cos(rad)]]))
    matrix_final=np.round(np.linalg.solve(matrix_rotation,np.array([vec[0],vec[1]])),2)
    return np.hstack([matrix_final,vec[2]])
