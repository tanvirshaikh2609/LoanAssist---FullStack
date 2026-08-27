"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
app = application

# Run auto-migration on Vercel initialization if running serverless
if bool(os.environ.get('VERCEL') or os.environ.get('VERCEL_ENV')):
    try:
        from django.core.management import call_command
        call_command('migrate', interactive=False)

        # Seed master bank and credit card data if table is empty
        try:
            from cards.models import CreditCard
            if not CreditCard.objects.exists():
                call_command('seed_master_data', interactive=False)
        except Exception:
            pass
    except Exception as e:
        print(f"Serverless DB auto-init note: {e}")

