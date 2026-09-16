import re

with open('./src/components/ProfileConfigModal.tsx', 'r') as f:
    content = f.read()

# Add Age and Gender display below the username in Profile Config
age_gender_display = """
        {/* User Info (Read-only) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">{user.username}</h2>
          <div className="flex items-center justify-center gap-4 text-white/50 text-sm">
            {user.gender && <span>Gender: {user.gender}</span>}
            {user.age !== undefined && <span>Age: {user.age}</span>}
            {user.birthdate && <span>DOB: {user.birthdate}</span>}
          </div>
        </div>
"""

content = re.sub(
    r'(<div className="flex flex-col items-center gap-4">)',
    age_gender_display + '\n        ' + r'\1',
    content
)

with open('./src/components/ProfileConfigModal.tsx', 'w') as f:
    f.write(content)
