# Fix for Pesapal Log Path Permission Error

## Problem
The `pesapal_service.py` file is trying to create a log directory at `/Users/...` which is a macOS path. On Render (Linux), this causes a `PermissionError: [Errno 13] Permission denied: '/Users'`.

## Solution: Use Environment Variable (Option 1)

### Step 1: Update `inventory/services/pesapal_service.py`

Find the section where `log_path` is defined (around the line with `os.makedirs(os.path.dirname(log_path), exist_ok=True)`) and replace it with:

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

### Step 2: Set Environment Variable in Render

1. Go to your Render dashboard
2. Navigate to your service → **Environment** tab
3. Add a new environment variable:
   - **Key**: `PESAPAL_LOG_PATH`
   - **Value**: `/tmp/pesapal_logs/pesapal.log`
4. Save the environment variable
5. The service will automatically redeploy

### Alternative: If you want logs in project directory

If you prefer logs in your project directory (which persists across deployments), use:

**Environment Variable Value**: `/opt/render/project/src/logs/pesapal/pesapal.log`

Or for a relative path from the project root:

```python
import os
from pathlib import Path

# Get project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
log_dir = BASE_DIR / 'logs' / 'pesapal'
log_path = os.getenv('PESAPAL_LOG_PATH', str(log_dir / 'pesapal.log'))

# Ensure directory exists
os.makedirs(os.path.dirname(log_path), exist_ok=True)
```

## Testing

After deploying:
1. Try creating an order and initiating payment
2. Check Render logs - the permission error should be gone
3. Verify the log file is created at the specified path

## Notes

- `/tmp` is always writable on Linux and is cleared on restart (good for logs)
- Project directory logs persist but require the directory to exist
- The environment variable approach allows different paths for dev/staging/production
