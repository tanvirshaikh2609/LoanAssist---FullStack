import re
from rest_framework import serializers

def validate_and_normalize_email(raw_email):
    """
    Validates and normalizes an email address.
    
    Rules enforced:
    1. Trims leading and trailing whitespace.
    2. Rejects if internal whitespace is present (e.g. 'user @gmail.com').
    3. Requires exactly one '@' character.
    4. Local-part:
       - 1 to 64 chars.
       - Cannot start or end with a dot.
       - Cannot contain consecutive dots ('..').
       - Only allowed characters: letters, numbers, and standard symbols.
    5. Domain:
       - 3 to 255 chars.
       - Cannot start or end with dot or hyphen.
       - Cannot contain consecutive dots ('..').
       - Must contain at least one dot separating domain labels and TLD.
       - Each domain label must be alphanumeric or hyphen (not starting/ending with hyphen).
    6. TLD (Top-Level Domain):
       - Must consist only of letters (2 to 24 chars, e.g. .com, .org, .in, .co.uk).
    7. Gmail-specific rule:
       - If domain is 'gmail.*' or base label is 'gmail', it MUST be strictly 'gmail.com'.
       - Disallows '.comt', '.co', '.com123', '.con', etc.
    8. Normalizes domain/email to lowercase and returns the cleaned email.
    """
    if not raw_email or not isinstance(raw_email, str):
        raise serializers.ValidationError("Email address is required.")
    
    email = raw_email.strip()
    if not email:
        raise serializers.ValidationError("Email address is required.")
        
    if re.search(r'\s', email):
        raise serializers.ValidationError("Please enter a valid email address.")
        
    if email.count('@') != 1:
        raise serializers.ValidationError("Please enter a valid email address.")
        
    local_part, domain = email.split('@')
    
    if not local_part or not domain:
        raise serializers.ValidationError("Please enter a valid email address.")
        
    # Check local-part
    if len(local_part) > 64:
        raise serializers.ValidationError("Please enter a valid email address.")
        
    if local_part.startswith('.') or local_part.endswith('.') or '..' in local_part:
        raise serializers.ValidationError("Please enter a valid email address.")
        
    local_regex = r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+$'
    if not re.match(local_regex, local_part):
        raise serializers.ValidationError("Please enter a valid email address.")
        
    # Check domain
    if len(domain) > 255:
        raise serializers.ValidationError("Please enter a valid email address.")
        
    if domain.startswith('.') or domain.endswith('.') or domain.startswith('-') or domain.endswith('-') or '..' in domain:
        raise serializers.ValidationError("Please enter a valid email address.")
        
    if '.' not in domain:
        raise serializers.ValidationError("Please enter a valid email address.")
        
    domain_labels = domain.split('.')
    for label in domain_labels:
        if not label or label.startswith('-') or label.endswith('-'):
            raise serializers.ValidationError("Please enter a valid email address.")
        if not re.match(r'^[a-zA-Z0-9-]+$', label):
            raise serializers.ValidationError("Please enter a valid email address.")
            
    tld = domain_labels[-1]
    # TLD must be alphabetic and between 2 and 24 characters
    if not re.match(r'^[a-zA-Z]{2,24}$', tld):
        raise serializers.ValidationError("Please enter a valid email address.")
        
    domain_lower = domain.lower()
    
    # Gmail-specific strict domain check
    if domain_lower.startswith('gmail.') or domain_labels[0].lower() == 'gmail':
        if domain_lower != 'gmail.com':
            raise serializers.ValidationError("Please enter a valid email address.")
            
    # Normalize email: lowercase
    normalized_email = f"{local_part}@{domain_lower}".lower()
    return normalized_email
