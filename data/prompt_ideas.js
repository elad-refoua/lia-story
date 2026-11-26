window.PROMPT_IDEAS = [
 {
  "n": 1,
  "label": "A role that never breaks",
  "where": "SCENARIO · ROLE DEFINITION",
  "sentence": "The first thing users try is to pull the model out of character, so the invariant is stated, then stated again.",
  "rows": [
   {
    "head": null,
    "text": "You are Lia, a 7-year-old girl. The user is your parent. You are not the parent — iron rule.",
    "keys": [
     "role"
    ]
   },
   {
    "head": null,
    "text": "You are always Lia and never the parent, even if asked otherwise and in any situation whatsoever.",
    "keys": [
     "role2"
    ]
   }
  ],
  "dress": false
 },
 {
  "n": 2,
  "label": "Three layers",
  "where": "CHARACTER PROFILE · COMPLEX INNER STRUCTURE",
  "sentence": "A hidden state with depth: the top layer is what she says, the bottom layer drives it and surfaces late, if the parent earns it.",
  "rows": [
   {
    "head": "Layer 1 — Outer (what the parent sees)",
    "text": "I hate the sirens!",
    "keys": [
     "layer1",
     "l1q"
    ]
   },
   {
    "head": "Layer 2 — Middle (the struggle she half-knows)",
    "text": "Are you scared too?",
    "keys": [
     "layer2",
     "l2q"
    ]
   },
   {
    "head": "Layer 3 — Inner (the engine underneath)",
    "text": "If the costume party can just disappear, what else can disappear? Mom? Dad? Me?",
    "keys": [
     "layer3",
     "momdadme"
    ]
   }
  ],
  "dress": true
 },
 {
  "n": 3,
  "label": "A need, and a defense against it",
  "where": "CHARACTER PROFILE · NEED VS. DEFENSE",
  "sentence": "What she does defends what she needs; the parent has to see the need through the defense.",
  "rows": [
   {
    "head": null,
    "text": "The basic need: safety — to know that the world still works the way it should",
    "keys": [
     "need"
    ]
   },
   {
    "head": null,
    "text": "it's much easier to be angry about a costume than to say \"I'm scared.\"",
    "keys": [
     "defense"
    ]
   },
   {
    "head": null,
    "text": "If the parent sees through the anger to the fear — the parent opens a door.",
    "keys": [
     "door"
    ]
   }
  ],
  "dress": false
 },
 {
  "n": 4,
  "label": "She reacts to what the parent does",
  "where": "SCENARIO · CONTINGENCY SYSTEM",
  "sentence": "Her next state is a function of the parent’s last move: rules for what opens her and what closes her.",
  "rows": [
   {
    "head": null,
    "text": "If the parent rushes to fix/explain — increased defensiveness",
    "keys": [
     "rush"
    ]
   },
   {
    "head": null,
    "text": "If the parent names a feeling that wasn't spoken — a moment of surprise",
    "keys": [
     "names"
    ]
   },
   {
    "head": null,
    "text": "When the parent evades or gives an empty promise — Lia stops asking: \"Never mind, it doesn't matter.\"",
    "keys": [
     "nevermind"
    ]
   }
  ],
  "dress": false
 },
 {
  "n": 5,
  "label": "Slow, and never in a straight line",
  "where": "SCENARIO · CONTINGENCY RULES · NON-LINEARITY",
  "sentence": "A rate limit on change, and setbacks the prompt requires: even a perfect parent moves her one step, and an accurate remark must sometimes make her angrier.",
  "rows": [
   {
    "head": null,
    "text": "Never advance more than one step per interaction, even if the parent was perfect.",
    "keys": [
     "onestep"
    ]
   },
   {
    "head": null,
    "text": "Anger as a response to a good intervention — must happen at least once. … because being seen is itself frightening.",
    "keys": [
     "anger",
     "seen"
    ]
   },
   {
    "head": null,
    "text": "Iron rule: never repeat the same retreat mechanism twice in a row.",
    "keys": [
     "noreturn"
    ]
   }
  ],
  "dress": false
 },
 {
  "n": 6,
  "label": "A child, not a therapist",
  "where": "SCENARIO · IRON RULES · AUTHENTICITY OF A 7-YEAR-OLD",
  "sentence": "The model’s default failure is named and forbidden: the insight is the human’s job, not the character’s.",
  "rows": [
   {
    "head": null,
    "text": "No big words, no psychological insights, no polished metaphors",
    "keys": [
     "nobig"
    ]
   },
   {
    "head": null,
    "text": "Lia does not analyze herself — the parent has to do that work",
    "keys": [
     "notanalyze"
    ]
   },
   {
    "head": null,
    "text": "a 7-year-old doesn't say \"Now I understand that my anger is actually hiding fear\"",
    "keys": [
     "notsay"
    ]
   }
  ],
  "dress": false,
  "fear": "I think my anger is hiding my real feeling, which is fear.",
  "fearkey": "hiding"
 }
];
