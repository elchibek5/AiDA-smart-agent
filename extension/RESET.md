AIDA – Reset & Run

1) Start Backend (Terminal #1)
cd ~/aida/backend
npm install   # first time only
npm run dev

2) Open Extension (Terminal #2)
open -a "Visual Studio Code" ~/aida/extension

3) Build + Run Extension
cd ~/aida/extension
npm run compile
In VS Code: fn+F5 → In Dev Host: Cmd+Shift+P → "AIDA: Open Chat"
