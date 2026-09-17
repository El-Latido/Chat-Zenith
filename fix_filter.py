import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# add import
content = content.replace("import { TranslatedText } from './components/TranslatedText';", "import { TranslatedText } from './components/TranslatedText';\nimport { filterOffensiveText } from './filter';")

# Apply filter on message text
# Find originalText={m.text}
# Be careful: there's <TranslatedText originalText={m.text} ... /> in two places.
# 1) mecha_celestial theme (line ~2279)
# 2) regular theme (line ~2407)
# But wait, there are also replyTo.text, we can do it for them too.
# Let's just define a variable before rendering the message content:
# const isLiz = m.sender === "Elizabeth" || m.isAi;
# const safeText = isLiz ? filterOffensiveText(m.text || '') : (m.text || '');
# const safeReplyText = m.replyTo ? (isLiz ? filterOffensiveText(m.replyTo.text || '') : (m.replyTo.text || '')) : '';
# wait, replyTo can be from anyone, we don't easily know if replyTo was AI unless we check m.replyTo.sender.
# const safeReplyText = m.replyTo ? ( (m.replyTo.sender === "Elizabeth" || ['Sensei', 'Shadow', 'Neko'].includes(m.replyTo.sender)) ? filterOffensiveText(m.replyTo.text || '') : (m.replyTo.text || '') ) : '';

search = """                    .map((m, idx) => {
                      const isLiz = m.sender === "Elizabeth" || m.isAi;
                      const isMe = m.sender === user.username;"""
replacement = """                    .map((m, idx) => {
                      const isLiz = m.sender === "Elizabeth" || m.isAi;
                      const isMe = m.sender === user.username;
                      const safeText = isLiz ? filterOffensiveText(m.text || '') : (m.text || '');
                      const isReplyLiz = m.replyTo && (m.replyTo.sender === "Elizabeth" || ['Sensei', 'Shadow', 'Neko'].includes(m.replyTo.sender));
                      const safeReplyText = m.replyTo ? (isReplyLiz ? filterOffensiveText(m.replyTo.text || '') : (m.replyTo.text || '')) : '';"""
content = content.replace(search, replacement)

# Replace originalText={m.text} -> originalText={safeText}
content = content.replace('originalText={m.text}', 'originalText={safeText}')
content = content.replace('originalText={m.replyTo.text}', 'originalText={safeReplyText}')


with open('src/App.tsx', 'w') as f:
    f.write(content)

