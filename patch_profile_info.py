import re

with open('src/components/ProfileConfigModal.tsx', 'r') as f:
    content = f.read()

replacement = """                   <h3 className="text-2xl font-bold text-white">{user.username}</h3>
                   
                   <div className="flex gap-4 text-white/70 text-sm font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-inner">
                      {user.gender && <div className="flex items-center gap-1"><Users size={14} className="text-cyan-400"/> {user.gender}</div>}
                      {user.age !== undefined && <div className="flex items-center gap-1"><Calendar size={14} className="text-pink-400"/> {user.age} años</div>}
                   </div>
"""

content = re.sub(
    r'<h3 className="text-2xl font-bold text-white">\{user\.username\}</h3>',
    replacement,
    content
)

# Also need to make sure Users and Calendar are imported from lucide-react in ProfileConfigModal.tsx
if 'Calendar' not in content:
    content = content.replace('X, LogOut, Check', 'X, LogOut, Check, Users, Calendar')

with open('src/components/ProfileConfigModal.tsx', 'w') as f:
    f.write(content)
