
1. Setup the environment: (Mac: https://changelog.com/posts/install-node-js-with-homebrew-on-os-x and for Linux, see below):

```bash
sudo apt install nodejs npm
```

2. Clone the repo: `git clone <repo_link>`.
3. Install the dependencies, please make sure that you are in the folder:

```bash
npm install
```

If there is an error regarding the VSCode dependency error, please ensure that you have the latest version of VSCode installed (1.66.2).
4. Once done with step-3, in the VSCode window, open `src/extension.ts` file and press ctrl + F5 (run without debugging), and it will show you an option - select VSCode development option (something similar to this).
5. A new window will appear, please write a sample code, currently it only checks if assign is used instead of “==” and “===” in an if statement, so something like:

```javascript
if (2 = 3) {

}
```

And you should see an underline on the if statement. Please note that there will be multiple information blocks, one is something I used for debugging (0 2 10 3, you might see something like this). Please see the comments in `src/extension.ts` file for an explanation.

## Note

If you see an error similar to this: https://github.com/microsoft/vscode/issues/102180 please run `npm run compile` before trying to run the extension by pressing ctrl + F5 or F5.

## Credits

This code is mostly from [here](https://github.com/hchiam/custom-vscode-linter), and I’m working on this further to write an extension for LPython.
