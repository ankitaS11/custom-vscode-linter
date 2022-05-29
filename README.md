## Key Fetures:

1. Draws underline.
 ![image](https://user-images.githubusercontent.com/68434944/170823254-8e391875-8325-45e4-95d2-58d9fd48b88b.png)
 
2. Symbol Lookup
  ![image](https://user-images.githubusercontent.com/68434944/170823314-590190b2-842c-4bf9-8999-829458a4977f.png)
  
## Language Server Integration

The language server `[lpyth](https://github.com/ankitaS11/LanguageServer)` is responsible for providing the functionalities. 


## Installation:

Please follow the commands below:

```bash
# First install the LPython Language Server
git clone https://github.com/ankitaS11/LanguageServer && cd LanguageServer && python3 setup.py install

# Install the extension
git clone https://github.com/ankitaS11/custom-vscode-linter
cd custom-vscode-linter
npm install && npm run compile
```

## Usage

Once installation is done, enter the `custom-vscode-linter` folder, open VSCode and open the `extension.ts` file in the `src` folder. Now launch the extension using ctrl + F5 (select VSCode Extension Development if a dropdown appears).

Now create a new “python” file, just make sure it has more than 24 characters (as the metadata is hardcoded, so the line will be drawn from the 14th to 24th character). Save the file, and you’ll see the magic! :)

## Credits

This extension is WIP, but I would like to take this opportunity to thank a few people.

Thanks to Ondrej Certik for guiding throughout this project. As my manager, as well as a guide, he has been very kind and helpful.

Thanks to the creators of [custom-vscode-linter](https://github.com/hchiam/custom-vscode-linter) and [fortls](https://github.com/gnikit/fortls/tree/master/fortls) for open sourcing their code, as well as great instructions! I’ve learnt a lot from their codes, so thank you both!

