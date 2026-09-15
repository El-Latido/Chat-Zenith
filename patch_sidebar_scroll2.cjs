const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `          </div>
          <div className="px-4 mt-2">
            <button
              className={\`w-full flex items-center justify-center gap-2 text-cyan-400 bg-cyan-500/10 border \${isFriendReqOpen ? "border-cyan-500/50" : "border-cyan-500/20"} px-3 py-2 rounded-2xl hover:bg-cyan-500/20 transition-all text-sm font-medium\`}`;

const replacement = `          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin pb-4">
          <div className="px-4 mt-2">
            <button
              className={\`w-full flex items-center justify-center gap-2 text-cyan-400 bg-cyan-500/10 border \${isFriendReqOpen ? "border-cyan-500/50" : "border-cyan-500/20"} px-3 py-2 rounded-2xl hover:bg-cyan-500/20 transition-all text-sm font-medium\`}`;

code = code.replace(target, replacement);

const targetUsersContainer = `          {/* User Search */}
          <div className="px-4 py-2">
            <form`;

// We don't want the inner container to be scrollable anymore because the parent is now scrollable
const targetUsersList = `          <div className="flex-1 overflow-y-auto px-2 py-4">
            <h3 className="text-[#8B98B0] text-xs font-bold uppercase tracking-wider mb-3 px-2 flex justify-between items-center">`;

const replacementUsersList = `          <div className="px-2 py-4">
            <h3 className="text-[#8B98B0] text-xs font-bold uppercase tracking-wider mb-3 px-2 flex justify-between items-center">`;

code = code.replace(targetUsersList, replacementUsersList);

// End the new wrapper after the user list mapping
const targetEnd = `              );
            })}
          </div>`;

const replacementEnd = `              );
            })}
          </div>
          </div> {/* End of scrollable wrapper */}`;

// Let's replace the FIRST occurrence of the end target that comes after `targetUsersList`.
// Since there are multiple maps, let's be careful.
const afterUserList = `              );
            })}
          </div>
        </aside>

        {/* Main Chat Container */}`;
const replacementAfterUserList = `              );
            })}
          </div>
          </div>
        </aside>

        {/* Main Chat Container */}`;

code = code.replace(afterUserList, replacementAfterUserList);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched sidebar scrolling");
