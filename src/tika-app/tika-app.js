import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-styles/shadow.js';

// lazily loaded
import('@polymer/polymer/lib/elements/dom-repeat.js');
import('@polymer/iron-icon/iron-icon.js');
import('@polymer/paper-progress/paper-progress.js');
import('@polymer/paper-button/paper-button.js');
import('@polymer/paper-toast/paper-toast.js');
import('@polymer-vis/file-drop-zone/file-drop-zone.js');

import('./tika-icons.js');

// set passive
setPassiveTouchGestures(true);

/**
 * @customElement
 * @polymer
 */
class TikaApp extends GestureEventListeners(PolymerElement) {
  static get template() {
    return html`
      <style include="iron-flex iron-flex-alignment">
      :host {
        display: block;
        margin: 0px;
        padding: 0px;
        padding-bottom: 50px;
        color: #444;
        @apply --layout-vertical;
      }

      file-drop-zone {
        border: 1px dashed transparent;
        color: #aaa;
        background-color: #fafafa;
        width: 100%;
        height: 300px;
        transition: all .3s;
        @apply --shadow-elevation-2dp;

      }
      file-drop-zone[disabled] {
        opacity: 0.5;
        pointer-events: none;
      }
      file-drop-zone:hover {
        @apply --shadow-elevation-4dp;
      }
      file-drop-zone.dragover {
        border: 1px dashed #E91E63;

      }
      file-drop-zone:hover > [slot='drop-zone'],
      file-drop-zone.dragover > [slot='drop-zone'] {
        color: #E91E63;
        transition: all .3s;
      }
      file-drop-zone.errored {
        background-color: #FFEBEE;
        transition: all .3s;
      }
      file-drop-zone[has-files] {
        color: #2196F3;
        transition: all .3s;
      }
      [slot='drop-zone'] {
        text-align: center;
        font-size: 1.1em;
        --iron-icon-height: 64px;
        --iron-icon-width: 64px;
      }
      [slot='drop-zone'] > .title {
        font-size: 1.2em;
      }
      [slot='drop-zone'] > .small{
        font-size: 0.6em;
      }
      .card {
        font-size: 0.8em;
        color: #555;
        margin: 0px;
        margin-bottom: 5px;
        background-color: #fafafa;
        pointer-events: auto;
        --iron-icon-height: 32px;
        --iron-icon-width: 32px;
        @apply --shadow-elevation-2dp;
        transition: all .3s;
      }
      .card:hover {
        @apply --shadow-elevation-4dp;
      }
      .card > div {
        padding: 5px;
      }
      .card[disabled], .card[invalid] {
        color: #888;
        pointer-events: none;
      }
      paper-progress {
        width: 100%;
        margin: 0px;
        padding: 0px;
      }
      paper-progress[disabled] {
        opacity: 0;
      }
      paper-button {
        cursor: pointer;
        color: #2196F3;
      }
      paper-button[disabled] {
        color: #ccc;
      }
      .error {
        margin-left: 10px;
        font-weight: bold;
        font-style: italic;
        font-size: 0.8em;
        color: #E91E63;
      }
      </style>

      <file-drop-zone
        disabled$="[[processing]]"
        multiple
        accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
        files="{{files}}"
        last-error="{{error}}"
        on-error="onError">

        <div slot="drop-zone" class="layout vertical center center-justified">
          <iron-icon icon="document"></iron-icon>
          <div class="title">Drop your images or documents here!</div>
          <div class="small"><i>(max file size: 10 MB)</i></div>
          <!-- error message -->
          <div class="small">[[error.message]]</div>
        </div>
      </file-drop-zone>

      <br/>
      <!-- list of file selected -->
      <template is="dom-repeat" items="[[files]]">
        <div class="card" disabled$="[[item.processing]]"
          invalid$="[[_invalidSize(item.size)]]">
          <div class="layout horizontal center">
            <iron-icon icon="document" class$="[[item.type]]"></iron-icon>
            <div class="flex">
              <b>[[item.name]]</b><br/>
              <i><small>[[item.type]] - [[_returnFileSize(item.size)]]</small></i>
              <span class="error">
                [[_renderError(item.error, item.size)]]
              </span>
            </div>
            <paper-button data-type="html"
              on-click="_onDownload"
              title="Click to download HTML!">
                <iron-icon icon="file-download" data-type="html"></iron-icon> HTML
            </paper-button>
            <paper-button data-type="plain"
              on-click="_onDownload"
              title="Click to download Plain Text file!">
                <iron-icon icon="file-download" data-type="plain"></iron-icon> TXT
            </paper-button>
          </div>
          <paper-progress indeterminate disabled="[[!item.processing]]">
          </paper-progress>
        </div>
      </template>

      <paper-toast id="toast" text="[[msg]]"></paper-toast>
    `;
  }
  static get properties() {
    return {
      title: {
        type: String,
        value: 'tika-app'
      },
      files: {
        type: Array,
        notify: true,
        value: null
      },
      maxSize: {
        type: Number,
        value: 1024 * 1024 * 10
      },
      currentText: String,
      processing: Boolean,
      msg: String
    };
  }

  _readyToProcess(files, processing) {
    return processing || !(files && files.length > 0);
  }

  _showErrorMsg(error) {
    this.msg = `ERROR: ${error.message}`;
    this.$.toast.open();
  }

  _onStartJobs(e) {
    this._execJob(0);
  }

  async _runJob(jobId, output = 'plain') {
    var opts = {
      method: 'PUT',
      headers: { Accept: `text/${output}` },
      body: this.files[jobId]
    };

    this.set(['files', jobId, 'processing'], true);
    try {
      var response = await fetch('./api/tika', opts);
      if (response.ok) {
        let text = await response.text();
        this.set(['files', jobId, output], text);
      } else {
        this.set(['files', jobId, 'error'], response.statusText);
        this._showErrorMsg({
          message: `ERROR${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      this._showErrorMsg(error);
    }
    this.set(['files', jobId, 'processing'], false);
    return this.get(['files', jobId, output]) || '';
  }

  async _onDownload(e) {
    const subtype = e.target.getAttribute('data-type');
    var content = e.model.item[subtype];
    if (!content) {
      this.processing = true;
      content = await this._runJob(e.model.index, subtype);
      this.processing = false;
      if (!content) return;
    }
    const { name } = e.model.item;
    const blob = new Blob([content], { type: `text/${subtype}` });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = `${name}.${subtype == 'html' ? subtype : 'txt'}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  _returnFileSize(number) {
    if (number < 1024) {
      return number + 'bytes';
    } else if (number >= 1024 && number < 1048576) {
      return (number / 1024).toFixed(1) + 'KB';
    } else if (number >= 1048576) {
      return (number / 1048576).toFixed(1) + 'MB';
    }
  }

  _invalidSize(number) {
    return this.maxSize < number;
  }

  _renderError(error, size) {
    if (error) return error;
    else
      return this._invalidSize(size)
        ? `Max file size allowed is ${this._returnFileSize(this.maxSize)}!`
        : '';
  }
}

window.customElements.define('tika-app', TikaApp);
