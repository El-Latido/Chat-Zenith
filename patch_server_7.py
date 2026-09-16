import re

with open('server.ts', 'r') as f:
    content = f.read()

fallback_validation = """      } else {
        if (fallbackState.users[username]) {
"""
fallback_validation_replace = """      } else {
        if (fallbackState.users[username]) {
"""

# Wait, let's look at the fallback block first.
