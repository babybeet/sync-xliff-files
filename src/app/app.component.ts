import { Component } from '@angular/core';

@Component({
  selector: 'tdz-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  messages = [] as string[];
  sourceLanguageFile: File = null;
  targetLanguageFile: File = null;

  syncSourceAndTargetXliffFiles() {
    Promise.all([this._readFile(this.sourceLanguageFile), this._readFile(this.targetLanguageFile)])
      .then(([sourceLanguageDocument, targetLanguageDocument]) => {
        const container = document.createElement('body');

        sourceLanguageDocument.querySelectorAll('trans-unit')
          .forEach(sourceUnit => {
            const transUnitId = sourceUnit.getAttribute('id');
            const targetUnit = targetLanguageDocument.querySelector(`#${transUnitId}`);
            const resultedNode = sourceUnit.cloneNode(true) as HTMLElement;
            const sourceText = sourceUnit.querySelector('original').textContent;
            let missingTranslation = false;

            if (targetUnit) {
              const target = targetUnit.querySelector('target');

              if (target) {
                resultedNode.querySelector('original').insertAdjacentElement('afterend', target);
              } else {
                missingTranslation = true;
                this.messages.push(`No translation found for "${transUnitId.replace('_', '')}" ("${sourceText}").`);
              }
              container.appendChild(resultedNode);
            } else {
              missingTranslation = true;
              container.appendChild(resultedNode);
              this.messages.push(`No translation found for "${transUnitId.replace('_', '')}" ("${sourceText}").`);
            }
            if (missingTranslation) {
              this._addTodoCommentBeforeNode(resultedNode);
            }
          });

        const serializer = new XMLSerializer();
        const serializedDocument = serializer.serializeToString(container)
          .replace(/(<trans-unit\s+?id=")_/gm, '$1')
          .replace(/<(\/?)original>/gm, '<$1source>')
          .replace(/_x_/gm, '<x')
          .replace(/\/&gt;/gm, '/>')
          .replace(/(<\/trans-unit>)/gm, '$1\n\n')
          .replace(/<body[\s\S]+?>/, '<body>');

        const syncedDocument = this._stripMargin(`
          |<?xml version="1.0" encoding="UTF-8" ?>
          |<xliff version="1.2"
          |    xmlns="urn:oasis:names:tc:xliff:document:1.2">
          |    <file source-language="en-US" datatype="plaintext" original="ng2.template">
          |        ${serializedDocument}
          |    </file>
          |</xliff>
        `);
        this._download(syncedDocument, this.targetLanguageFile.name);
        this.sourceLanguageFile = null;
        this.targetLanguageFile = null;
      });
  }

  private _readFile(file: File): Promise<Document> {
    return new Promise<Document>(resolve => {
      const fileReader = new FileReader();

      fileReader.onload = () => resolve(this._parseXliffFileIntoDocument(fileReader.result as string));
      fileReader.onerror = () => alert(`There was a problem reading file "${file.name}"`);
      fileReader.readAsText(file);
    });
  }

  private _parseXliffFileIntoDocument(fileContent: string) {
    fileContent = fileContent.replace(/(<trans-unit\s+?id=")/gm, '$1_')
      .replace(/<(\/?)source>/gm, '<$1original>')
      .replace(/<x(\s+)/gm, '_x_$1');
    return new DOMParser().parseFromString(fileContent, 'text/html');
  }

  private _stripMargin(str: string) {
    return str.replace(/(?:\s+\|)/g, '\n').trim();
  }

  private _addTodoCommentBeforeNode(node: HTMLElement) {
    const comment = document.createComment('TODO' + ':' + ' Add translation for this unit');
    node.parentElement.insertBefore(comment, node);
  }

  private _download(fileContent: string, fileName: string) {
    const a = document.createElement('a');
    const downloadLink = URL.createObjectURL(new Blob([fileContent]));

    a.setAttribute('style', 'postition:fixed;opacity:0;');
    a.href = downloadLink;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.appendChild(a);
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadLink);
  }

}
