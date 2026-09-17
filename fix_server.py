import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add to firebase extraction
firebase_extract = """            userGender = user?.gender || "";
            userAge = user?.age || 0;
            userMood = user?.mood || "";
            preferredBackground = user?.preferred_background || "";"""

new_firebase_extract = firebase_extract + """
            let preferredTheme = user?.preferred_theme || "";
            let bubbleColor = user?.bubbleColor || "";
            let bubbleBorder = user?.bubbleBorder || "";
            let bubbleShape = user?.bubbleShape || "";
            let bubbleTexture = user?.bubbleTexture || "";
            let audioVisualizerStyle = user?.audioVisualizerStyle || "";
            let audioVisualizerColor1 = user?.audioVisualizerColor1 || "";
            let audioVisualizerColor2 = user?.audioVisualizerColor2 || "";
"""

content = content.replace(firebase_extract, new_firebase_extract)

# Add to callback payload
payload = """            is_friends_public: isFriendsPublic,
            friends_list: friendsList,
            blocked_list: blockedList,
            awards,
            lizCoins,
            activeDecoration,
            ownedDecorations,
            elo,
            uid,
            profileLikes,
            incognito,
            gender: userGender,
            age: userAge,
            mood: userMood,
            preferred_background: preferredBackground,
          });"""

new_payload = """            is_friends_public: isFriendsPublic,
            friends_list: friendsList,
            blocked_list: blockedList,
            awards,
            lizCoins,
            activeDecoration,
            ownedDecorations,
            elo,
            uid,
            profileLikes,
            incognito,
            gender: userGender,
            age: userAge,
            mood: userMood,
            preferred_background: preferredBackground,
            preferred_theme: typeof preferredTheme !== 'undefined' ? preferredTheme : "",
            bubbleColor: typeof bubbleColor !== 'undefined' ? bubbleColor : "",
            bubbleBorder: typeof bubbleBorder !== 'undefined' ? bubbleBorder : "",
            bubbleShape: typeof bubbleShape !== 'undefined' ? bubbleShape : "",
            bubbleTexture: typeof bubbleTexture !== 'undefined' ? bubbleTexture : "",
            audioVisualizerStyle: typeof audioVisualizerStyle !== 'undefined' ? audioVisualizerStyle : "",
            audioVisualizerColor1: typeof audioVisualizerColor1 !== 'undefined' ? audioVisualizerColor1 : "",
            audioVisualizerColor2: typeof audioVisualizerColor2 !== 'undefined' ? audioVisualizerColor2 : "",
          });"""

content = content.replace(payload, new_payload)

with open('server.ts', 'w') as f:
    f.write(content)

