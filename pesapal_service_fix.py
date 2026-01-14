"""
FIX FOR: inventory/services/pesapal_service.py

Replace the log_path definition in the PesapalService.__init__ method
with this code. Look for the line around line 25 that has:
    os.makedirs(os.path.dirname(log_path), exist_ok=True)

Replace the log_path definition above that line with the code below.
"""

import os
from pathlib import Path

# Use environment variable or default to a writable location
# Default to /tmp on Linux (Render) or user home on macOS (local dev)
default_log_dir = '/tmp' if os.name != 'nt' else os.getenv('TEMP', os.getcwd())
log_path = os.getenv(
    'PESAPAL_LOG_PATH',
    os.path.join(default_log_dir, 'pesapal_logs', 'pesapal.log')
)

# Ensure directory exists
try:
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
except (OSError, PermissionError) as e:
    # Fallback to /tmp if the configured path fails
    if not log_path.startswith('/tmp'):
        log_path = os.path.join('/tmp', 'pesapal_logs', 'pesapal.log')
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
    else:
        raise
