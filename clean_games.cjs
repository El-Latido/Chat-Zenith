const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove PoolGameModal import
code = code.replace(/import \{ PoolGameModal \} from '\.\/components\/PoolGameModal';\n?/, '');

// 2. Remove states
code = code.replace(/  const \[poolData, setPoolData\] = useState<any>\([^)]*\);\n?/, '');
code = code.replace(/  const \[tutiFruttiState, setTutiFruttiState\] = useState<any>\([^)]*\);\n?/, '');
code = code.replace(/  const tutiFruttiStateRef = useRef<any>\([^)]*\);\n?/, '');
code = code.replace(/  useEffect\(\(\) => \{ tutiFruttiStateRef\.current = tutiFruttiState; \}, \[tutiFruttiState\]\);\n?/, '');
code = code.replace(/  const \[tfMyAnswers, setTfMyAnswers\] = useState<any>\([^)]*\);\n?/, '');
code = code.replace(/  const tfAnswersRef = useRef<any>\([^)]*\);\n?/, '');

// 3. Remove Tuti useEffects
code = code.replace(/  useEffect\(\(\) => \{\s*if \(tutiFruttiState\.isActive && tutiFruttiState\.answers[\s\S]*?\}, \[tutiFruttiState\.isActive, tutiFruttiState\.answers\]\);\n?/g, '');
code = code.replace(/  useEffect\(\(\) => \{\s*if \(tutiFruttiState\.currentRound === tutiFruttiState\.totalRounds[\s\S]*?\}, \[tutiFruttiState\.currentRound, tutiFruttiState\.totalRounds, tutiFruttiState\.isActive, tutiFruttiState\.roundResults\]\);\n?/g, '');

// 4. Clean activeChat checks
code = code.replace(/activeChat === 'global' \|\| activeChat === 'tutifrutti'/g, "activeChat === 'global'");
code = code.replace(/isGamesMenuOpenRef\.current \|\| activeChessGameRef\.current \|\| tutiFruttiStateRef\.current\?\.isActive/g, "isGamesMenuOpenRef.current || activeChessGameRef.current");

// 5. Remove socket listeners
code = code.replace(/    socket\.on\('tutifrutti_state'[\s\S]*?\}\);\n/g, '');
code = code.replace(/    socket\.on\('request_tutifrutti_answers'[\s\S]*?\}\);\n/g, '');
code = code.replace(/    socket\.on\('pool_invite_accepted'[\s\S]*?\}\);\n/g, '');
code = code.replace(/    socket\.on\('pool_invite_rejected'[\s\S]*?\}\);\n/g, '');

code = code.replace(/      socket\.off\('tutifrutti_state'\);\n/g, '');
code = code.replace(/      socket\.off\('request_tutifrutti_answers'\);\n/g, '');
code = code.replace(/      socket\.off\('pool_invite_accepted'\);\n/g, '');
code = code.replace(/      socket\.off\('pool_invite_rejected'\);\n/g, '');

// 6. Remove Pool render
code = code.replace(/      \{poolData && \([\s\S]*?<PoolGameModal[\s\S]*?\/>\n      \)\}\n/g, '');

// 7. Remove Tuti Sidebar button
const tutiBtnRegex = /                     <button className=\{`flex items-center justify-center gap-2 text-\[#D4AF37\] bg-\[#121B2A\]\/80 border[\s\S]*?Tuti Frutti\n                     <\/button>\n/g;
code = code.replace(tutiBtnRegex, '');

// 8. Remove Game logic from onSelectGame (and global handlePrivateGame logic)
code = code.replace(/                  \} else if \(gameId === 'poolsolo'\) \{[\s\S]*?\}\);\n/g, ''); // Pool global logic
// Also the one that has "return;" at the end inside pool_ logic.
code = code.replace(/                  \} else if \(gameId\.startsWith\('pool_'\)\) \{[\s\S]*?toast\.success\("Invitación de Billar enviada( al chat global)?\."\);\n/g, '');
code = code.replace(/                  if \(gameId === 'tutifrutti'\) \{\n                      setActiveChat\('tutifrutti'\);\n                      return;\n                  \}\n/g, '');
code = code.replace(/                   if \(gameId === 'tutifrutti'\) \{\n                       setActiveChat\('tutifrutti'\);\n                       return;\n                   \}\n/g, '');

// 9. Remove pool invite message
code = code.replace(/                                         \{m\.type === 'pool_invite' && m\.inviteData && \([\s\S]*?<\/div>\n                                         \)\}\n/g, '');

// 10. Remove the whole Tuti view and Pool view in the main chat area.
// We are looking for: {activeChat === 'tutifrutti' ? ( ... ) : activeChat === 'pool' && poolData ? ( ... ) : (
// The safest way is to locate `{activeChat === 'tutifrutti' ? (` and then `) : (` that follows `activeChat === 'pool'`
// Actually, let's just find the start:
let tutiStart = code.indexOf("{activeChat === 'tutifrutti' ? (");
if (tutiStart > -1) {
    // we need to find the matching parenthesis or just find the fallback.
    // The fallback is typically `) : (` followed by `<div className="flex-1 overflow-y-auto...` or similar.
    let fallbackRegex = /\) : \(\n\s*<div className="flex-1/g;
    fallbackRegex.lastIndex = tutiStart;
    let match = fallbackRegex.exec(code);
    if (match) {
        code = code.substring(0, tutiStart) + match[0].substring(6) + code.substring(match.index + match[0].length);
    }
}

// 11. Remove poolData from activeChat checks
code = code.replace(/activeChat !== 'global' && activeChat !== 'tutifrutti'/g, "activeChat !== 'global'");
code = code.replace(/activeChat !== 'global'/g, "activeChat !== 'global'");

fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned src/App.tsx");
