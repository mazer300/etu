import math

from pyexpat.errors import messages


def decrypt_scytale(ciphertext, num_cols):
    length = len(ciphertext)
    num_rows = math.ceil(length / num_cols)

    matrix = [[''] * num_cols for _ in range(num_rows)]

    idx = 0
    for i in range(num_rows):
        for j in range(num_cols):
            if idx < length:
                matrix[i][j] = ciphertext[idx]
                idx += 1
    result = ""

    for j in range(num_cols):
        for i in range(num_rows):
            if matrix[i][j] != '':
                result += matrix[i][j]

    return result


def decrypt_vigenere(ciphertext, key):
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    ciphertext = ciphertext.upper()
    key = key.upper()

    result = ""
    key_idx = 0

    for char in ciphertext:
        if char in alphabet:
            c_idx = alphabet.index(char)
            k_idx = alphabet.index(key[key_idx % len(key)])

            p_idx = (c_idx - k_idx + 26) % 26
            result += alphabet[p_idx]

            key_idx += 1
        else:
            result += char

    return result


def mod_inverse(a, m):
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return None


def matrix_determinant(matrix):
    a, b, c = matrix[0]
    d, e, f = matrix[1]
    g, h, i = matrix[2]
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)


def matrix_adjugate(matrix):
    a, b, c = matrix[0]
    d, e, f = matrix[1]
    g, h, i = matrix[2]

    adj = [
        [e * i - f * h, -(b * i - c * h), b * f - c * e],
        [-(d * i - f * g), a * i - c * g, -(a * f - c * d)],
        [d * h - e * g, -(a * h - b * g), a * e - b * d]
    ]

    return adj


def decrypt_hill(ciphertext, key_matrix):
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    ciphertext = ciphertext.upper()

    det = matrix_determinant(key_matrix) % 26
    det_inv = mod_inverse(det, 26)

    if det_inv is None:
        raise ValueError("Матрица необратима! Расшифровка невозможна.")

    adj = matrix_adjugate(key_matrix)
    inv_matrix = [[(det_inv * adj[i][j]) % 26 for j in range(3)] for i in range(3)]

    result = ""
    for i in range(0, len(ciphertext), 3):
        block = ciphertext[i:i + 3]
        if len(block) < 3:
            block += 'X' * (3 - len(block))

        vec = [alphabet.index(c) for c in block]

        p_vec = [
            sum(inv_matrix[row][col] * vec[col] for col in range(3)) % 26
            for row in range(3)
        ]

        result += "".join(alphabet[idx] for idx in p_vec)

    return result


import math


def decrypt_adfgvx(ciphertext, sub_key, trans_key):
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    unique_key = ""
    for char in sub_key.upper() + alphabet:
        if char not in unique_key and char in alphabet:
            unique_key += char

    square = [list(unique_key[i * 6:(i + 1) * 6]) for i in range(6)]
    adfgvx = "ADFGVX"

    ciphertext = ciphertext.replace(" ", "").upper()
    n = len(trans_key)
    L = len(ciphertext)
    num_rows = math.ceil(L / n)
    remainder = L % n

    col_lengths = [num_rows] * n
    if remainder != 0:
        for j in range(remainder, n):
            col_lengths[j] = num_rows - 1

    matrix = [[''] * n for _ in range(num_rows)]
    key_order = sorted(range(n), key=lambda k: trans_key[k])

    idx = 0
    for col in key_order:
        length = col_lengths[col]
        for row in range(length):
            matrix[row][col] = ciphertext[idx]
            idx += 1

    intermediate = ""
    for row in matrix:
        intermediate += "".join(row)

    result = ""
    for i in range(0, len(intermediate), 2):
        if i + 1 < len(intermediate):
            r = adfgvx.index(intermediate[i])
            c = adfgvx.index(intermediate[i + 1])
            result += square[r][c]

    return result


def decrypt_agent(ciphertext, key):
    alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"
    ciphertext = ciphertext.upper()
    key = key.upper()

    res=""
    for s in ciphertext:
        if s in alphabet:
            i=alphabet.index(s)
            res+=alphabet[(i-3)%33]

    mixed_alphabet = ""
    for char in key + alphabet:
        if char not in mixed_alphabet and char in alphabet:
            mixed_alphabet += char

    decrypt_dict = {mixed_alphabet[i]: alphabet[i] for i in range(len(alphabet))}

    result = ""
    for char in res:
        if char in decrypt_dict:
            result += decrypt_dict[char]
        else:
            result += char

    return result


if __name__ == "__main__":
    #message=decrypt_scytale("s etcerxett", 2)

    #message=decrypt_vigenere("TGFSGW UGAU","BCD")

    #message=decrypt_hill("GAWEUD",[[1,2,3],[4,5,6],[7,8,10]])
    #message = decrypt_adfgvx("DVDAVGAGGGFAADDXFAGV","SUBSTITUTION","TRANSPOSITION")

    #message =decrypt_agent("УЁИТЁФ","ЛОЗУНГ")
    print(message)