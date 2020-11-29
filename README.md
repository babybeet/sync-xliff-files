# WTF is this?
This project was created for an application that I've been working on called Meme Composer which can be accessed here https://memecomposer.com.

Meme Composer supports multiple locales by using Angular's Internationalization feature to make translating texts a seamless process, the problem arises when I need to run `ng extract-i18n` to generate an updated XLIFF-format file, whose default name is `messages.xlf`, that contains texts to be translated from English to other languages, and the generated file always contains very large diff's because existing `trans-unit` blocks often get moved to different locations, so it's very annoying and time consuming to keep the other locale files in sync with the generated file `messages.xlf`, this tool makes it much more time efficient and easier to synchorinize changes between the existing locale files and the updated `messages.xlf`. For any `trans-unit`'s that don't have a translation yet, a comment of `<!-- TODO: Add translation for this unit -->` is inserted right above those `trans-unit`'s so you can easily search for them.

This project is just a snippet taken from Meme Composer application and was made open-source.

# How do I use this tool?
You can access this tool by following this link https://memecomposer.com/en/extras/sync-xliff-files, its UI looks like this. Click "Upload source language file" to upload the XLIFF file that Angular's i18n tool generates, click "Upload target language file" to upload the locale file that contains the translations.
![UI of XLIFF files syncing tool](src/assets/ui.png?v=2)


# What does it lack?
Currently, the downloaded XLIFF file isn't prettified completely, this part wasn't accounted for because you will always copy the downloaded XLIFF file into your favorite IDE which can prettify the file for you since it's just XML.