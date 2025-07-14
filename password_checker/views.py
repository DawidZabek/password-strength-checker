from django.shortcuts import render
import math
import string
import hashlib
import requests
import bcrypt
from argon2 import PasswordHasher
from rest_framework.decorators import api_view
from rest_framework.response import Response

HIBP_API = "https://api.pwnedpasswords.com/range/"

def check_pwned_password(password):
    sha1 = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    response = requests.get(HIBP_API + prefix)

    if response.status_code != 200:
        return -1  # API error or rate-limited

    hashes = (line.split(':') for line in response.text.splitlines())
    for hash_suffix, count in hashes:
        if hash_suffix == suffix:
            return int(count)

    return 0  # Not found

@api_view(['POST'])
def check_password_strength(request):
    password = request.data.get("password", "")
    length = len(password)

    lowers = sum(1 for c in password if c.islower())
    uppers = sum(1 for c in password if c.isupper())
    digits = sum(1 for c in password if c.isdigit())
    specials = sum(1 for c in password if c in string.punctuation)

    charset_size = 0
    if lowers: charset_size += 26
    if uppers: charset_size += 26
    if digits: charset_size += 10
    if specials: charset_size += 32

    entropy = round(length * math.log2(charset_size)) if charset_size else 0
    guesses = charset_size ** length if charset_size else 0
    brute_force_seconds = guesses / 1e10 if charset_size else 0

    # Hashing
    sha256 = hashlib.sha256(password.encode()).hexdigest()
    bcrypt_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    argon2_hash = PasswordHasher().hash(password)

    # HIBP check
    breach_count = check_pwned_password(password)

    return Response({
        "length": length,
        "has_lower": lowers > 0,
        "has_upper": uppers > 0,
        "has_digit": digits > 0,
        "has_special": specials > 0,
        "entropy": entropy,
        "brute_force_seconds": brute_force_seconds,
        "breach_count": breach_count,
        "sha256": sha256,
        "bcrypt": bcrypt_hash,
        "argon2": argon2_hash,
    })
