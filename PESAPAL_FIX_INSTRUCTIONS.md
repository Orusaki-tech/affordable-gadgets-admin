# Pesapal Service Fix - Step by Step Instructions

## Problem
The `pesapal_service.py` file is trying to create a log directory at `/Users/...` which causes a permission error on Render (Linux).

## Solution

### Step 1: Open Your Backend Repository
Navigate to your Django backend repository (separate from this frontend repo).

### Step 2: Open the File
Open `inventory/services/pesapal_service.py` in your backend repository.

### Step 3: Find the Problematic Code
Look for the `__init__` method in the `PesapalService` class, around line 25. You should see something like:

```python
class PesapalService:
    def __init__(self):
        # Look for something like this:
        log_path = '/Users/.../pesapal.log'  # or similar macOS path
        # OR
        log_path = os.path.expanduser('~/.../pesapal.log')
        # OR
        log_path = os.path.join('/Users', '...', 'pesapal.log')
        
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
```

### Step 4: Replace with Fixed Code
Replace the `log_path` definition and the `os.makedirs` line with this code:

```python
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
```

### Step 5: Set Environment Variable in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `affordable-gadgets-backend` service
3. Click on **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `PESAPAL_LOG_PATH`
   - **Value**: `/tmp/pesapal_logs/pesapal.log`
6. Click **Save Changes**
7. Render will automatically redeploy

### Step 6: Commit and Push

```bash
cd /path/to/your/backend/repository
git add inventory/services/pesapal_service.py
git commit -m "Fix Pesapal log path to use environment variable for Render compatibility"
git push
```

### Step 7: Verify the Fix

After Render redeploys (usually 1-2 minutes):
1. Try creating an order and initiating payment
2. Check Render logs - the permission error should be gone
3. Payment initiation should work successfully

## What This Fix Does

- Uses `PESAPAL_LOG_PATH` environment variable if set
- Defaults to `/tmp/pesapal_logs/pesapal.log` on Linux (Render)
- Falls back to `/tmp` if the configured path fails
- Works on both macOS (local dev) and Linux (Render production)

## Reference File

See `pesapal_service_fix.py` in this repository for the exact code snippet to use.
