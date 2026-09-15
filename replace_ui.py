import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. Add Missing Icons to imports
icons_to_add = ["Calendar", "Gift", "RotateCcw", "Repeat", "List", "Plus", "Volume2", "Clock"]
import_match = re.search(r'import \{([^\}]+)\} from "lucide-react";', content)
if import_match:
    existing_icons = import_match.group(1)
    for icon in icons_to_add:
        if icon not in existing_icons:
            existing_icons += f", {icon}"
    content = content.replace(import_match.group(0), f'import {{{existing_icons}}} from "lucide-react";')


# 2. Change root background color
content = content.replace('backgroundColor: "#030014"', 'backgroundColor: "#18181b"')

# 3. Strip the Cyberpunk / Neon Backgrounds (Lines 1640-1658)
# Safely find the block
bg_pattern = re.compile(r'\{\/\*\s*Cyberpunk Animated Glowing Accents\s*\*\/\}.*?(?=\{\/\*\s*Top Navigation Bar\s*\*\/\})', re.DOTALL)
content = bg_pattern.sub('', content)

# 4. Replace Top Navigation Bar
nav_replacement = """{/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-4 py-3 shrink-0 z-[100] relative w-full bg-[#18181b] border-b border-[#27272a]">
        <div className="flex-1 flex items-center justify-start gap-4">
          <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
             className="relative p-1 text-gray-300 hover:text-white transition-colors"
          >
             <Menu size={26} strokeWidth={2.5} />
             <div className="absolute top-1 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#18181b]" />
          </button>
        </div>

        <div className="flex-1 flex justify-center"></div>

        <div className="flex-1 flex items-center justify-end gap-5 text-gray-300">
           <button className="hover:text-white transition-colors"><Calendar size={22} /></button>
           <button className="hover:text-white transition-colors"><MessageSquare size={22} /></button>
           <button className="hover:text-white transition-colors"><UserPlus size={22} /></button>
           <button className="hover:text-white transition-colors"><Bell size={22} /></button>
           <button onClick={() => setIsProfileConfigOpen(true)} className="relative hover:opacity-80 transition-opacity">
             <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border border-white/10">
               {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={18} />}
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-yellow-500 rounded-full border-2 border-[#18181b] flex items-center justify-center">
             </div>
           </button>
        </div>
      </nav>"""

nav_pattern = re.compile(r'\{\/\*\s*Top Navigation Bar\s*\*\/\}.*?<\/nav>', re.DOTALL)
content = nav_pattern.sub(nav_replacement, content)


# 5. Replace Input Area
# Find exactly this block: `{/* Input Area */}` down to `</main>`
# But wait, we must not replace `</main>`. We replace up to the `</div>` that closes it.
# The original code looks like this:
#                 {/* Input Area */}
#                 <div className="px-4 py-3 ...
#                   ... (lots of stuff) ...
#                 </div>
#               </>
#             )}
#           </div>
#         </main>

input_replacement = """{/* Input Area */}
                <div className="px-4 py-3 shrink-0 bg-[#18181b] relative z-10 w-full flex flex-col gap-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
                  {typingUsers[activeChat] && typingUsers[activeChat].length > 0 && (
                     <div className="text-gray-400 text-xs italic px-2">Alguien está escribiendo...</div>
                  )}
                  {replyingTo && (
                     <div className="bg-[#27272a] rounded p-2 flex items-center justify-between text-xs text-gray-300 mx-2">
                       <span>Respondiendo a {replyingTo.sender}</span>
                       <button onClick={() => setReplyingTo(null)} className="hover:text-white transition-colors"><X size={14} /></button>
                     </div>
                  )}
                  {(selectedImage || audioUrl || selectedGif) && (
                     <div className="text-xs text-yellow-500 px-2 flex justify-between">
                       <span>Archivo adjunto listo para enviar</span>
                       <button onClick={() => { setSelectedImage(null); setAudioUrl(null); setSelectedGif(null); }}><X size={14} /></button>
                     </div>
                  )}
                  
                  {/* Top Row: Input field and surrounding icons */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button className="text-gray-400 hover:text-white transition-colors hidden sm:block"><Plus size={24} /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-white transition-colors"><Paperclip size={22} /></button>
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-white transition-colors"><Smile size={24} /></button>
                    <button className="text-gray-400 hover:text-white transition-colors hidden sm:block"><Volume2 size={24} /></button>
                    
                    <div className="flex-1 flex items-center bg-[#27272a] rounded-full px-4 py-2 relative">
                      <input
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
                        placeholder="Type here..."
                        id="chat-input-field"
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                    </div>
                    
                    <button onClick={toggleRecording} className="text-gray-400 hover:text-white transition-colors"><Mic size={24} /></button>
                    <button onClick={handleSendMessage} className="text-gray-400 hover:text-white transition-colors"><Send size={24} /></button>
                  </div>

                  {/* Bottom Row: Toolbar */}
                  <div className="flex items-center justify-between text-gray-400 mt-1 px-1">
                    <div className="flex items-center gap-5 sm:gap-6">
                      <button className="hover:text-white transition-colors"><Gift size={22} /></button>
                      <button className="hover:text-white transition-colors"><Play size={22} /></button>
                      <button className="hover:text-white transition-colors"><RotateCcw size={22} /></button>
                    </div>
                    
                    <div className="flex items-center gap-5 sm:gap-6">
                      <button className="hover:text-white transition-colors"><Repeat size={22} /></button>
                      <button className="hover:text-white transition-colors"><List size={22} /></button>
                    </div>
                  </div>
                </div>
              </>"""

# Find from {/* Input Area */} up to `</>` (since the replaced block has `</>` at the end of it too)
input_pattern = re.compile(r'\{\/\*\s*Input Area\s*\*\/\}.*?<\/div>\s*<\/>', re.DOTALL)
content = input_pattern.sub(input_replacement, content)

with open("src/App.tsx", "w") as f:
    f.write(content)
