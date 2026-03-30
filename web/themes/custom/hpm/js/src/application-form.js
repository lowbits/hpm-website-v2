/**
 * @file
 * Job application form – validation, drag-and-drop upload, AJAX submission.
 *
 * Ported from the HPM template source.
 */

(function (Drupal) {
  'use strict';

  Drupal.behaviors.hpmApplicationForm = {
    attach(context) {
      const form = context.querySelector('#bewerbung');
      if (!form || form.dataset.hpmFormInit) return;
      form.dataset.hpmFormInit = 'true';

      new ApplicationFormValidation(form);
    }
  };

  class ApplicationFormValidation {
    constructor(form) {
      this.form = form;
      this.host = form.closest('#form-host') || form;
      this.fileInput = form.querySelector('#files');
      this.drop = form.querySelector('#drop');
      this.fileMeta = form.querySelector('#file-meta');
      this.resetBtn = form.querySelector('#files-reset');
      this.selectedFiles = [];

      this.validateField = this.validateField.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

      this.init();
    }

    init() {
      this.setupDragAndDrop();
      this.bindInputValidation();
      this.form.addEventListener('submit', this.handleSubmit);
      this.renderFileMeta();
      this.updateResetVisibility();
    }

    /* ---- File helpers ---- */
    buildFileList(files) {
      const dt = new DataTransfer();
      files.forEach(f => dt.items.add(f));
      return dt.files;
    }

    fileKey(file) {
      return `${file.name}::${file.size}::${file.lastModified}`;
    }

    mergeFiles(newFiles) {
      const map = new Map(this.selectedFiles.map(f => [this.fileKey(f), f]));
      Array.from(newFiles || []).forEach(f => map.set(this.fileKey(f), f));
      this.selectedFiles = Array.from(map.values());
      this.syncInputFiles();
    }

    syncInputFiles() {
      if (!this.fileInput) return;
      this.fileInput.files = this.buildFileList(this.selectedFiles);
    }

    removeFileByKey(key) {
      this.selectedFiles = this.selectedFiles.filter(f => this.fileKey(f) !== key);
      this.syncInputFiles();
      this.renderFileMeta();
      this.updateResetVisibility();
      this.validateField(this.fileInput);
    }

    resetFiles() {
      this.selectedFiles = [];
      if (this.fileInput) {
        this.fileInput.value = '';
        this.fileInput.files = this.buildFileList([]);
      }
      this.renderFileMeta();
      this.updateResetVisibility();
      this.validateField(this.fileInput);
    }

    totalSizeBytes() {
      return this.selectedFiles.reduce((sum, f) => sum + (f?.size || 0), 0);
    }

    updateResetVisibility() {
      if (!this.resetBtn) return;
      this.resetBtn.style.display = this.selectedFiles.length ? 'inline' : 'none';
    }

    /* ---- Drag & Drop ---- */
    setupDragAndDrop() {
      if (!this.drop || !this.fileInput) return;

      ['dragenter', 'dragover'].forEach(ev =>
        this.drop.addEventListener(ev, (e) => {
          e.preventDefault();
          this.drop.style.background = '#fff8f5';
        })
      );

      ['dragleave', 'drop'].forEach(ev =>
        this.drop.addEventListener(ev, (e) => {
          e.preventDefault();
          this.drop.style.background = '';
        })
      );

      this.drop.addEventListener('drop', (e) => {
        const files = e.dataTransfer?.files;
        if (files && files.length) {
          this.mergeFiles(files);
          this.renderFileMeta();
          this.updateResetVisibility();
          this.validateField(this.fileInput);
        }
      });

      this.fileInput.addEventListener('change', () => {
        const files = this.fileInput.files;
        if (files && files.length) {
          this.mergeFiles(files);
        }
        this.renderFileMeta();
        this.updateResetVisibility();
        this.validateField(this.fileInput);
      });

      if (this.resetBtn) {
        this.resetBtn.addEventListener('click', () => this.resetFiles());
      }
    }

    renderFileMeta() {
      if (!this.fileMeta) return;

      if (!this.selectedFiles.length) {
        this.fileMeta.innerHTML = '';
        return;
      }

      const totalMB = (this.totalSizeBytes() / 1024 / 1024).toFixed(2);

      const items = this.selectedFiles.map(f => {
        const key = this.fileKey(f);
        const sizeMB = (f.size / 1024 / 1024).toFixed(2);
        const safeName = String(f.name)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

        return `
          <div class="file-meta-row" style="display:flex; gap:10px; align-items:center; justify-content:space-between; margin-top:4px;">
            <span class="file-meta-name" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${safeName} &bull; ${sizeMB} MB
            </span>
            <button type="button" class="file-remove" data-filekey="${key}"
                    aria-label="Datei entfernen"
                    style="flex:0 0 auto; padding:2px 6px; line-height:1; border-radius:4px;">
              &#10005;
            </button>
          </div>`;
      }).join('');

      this.fileMeta.innerHTML = `
        <div class="file-meta-list">
          ${items}
          <div class="file-meta-total" style="margin-top:6px;">
            Gesamt: <strong>${totalMB} MB</strong> (max. 10 MB)
          </div>
        </div>`;

      this.fileMeta.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-filekey');
          if (key) this.removeFileByKey(key);
        });
      });
    }

    /* ---- Validation ---- */
    bindInputValidation() {
      const ids = ['vorname', 'nachname', 'email', 'telefon', 'quelle', 'standort', 'gehalt'];

      ids.forEach(id => {
        const el = this.form.querySelector('#' + id);
        if (!el) return;

        if (el.tagName === 'SELECT') {
          el.addEventListener('change', () => this.validateField(el));
        }
        else {
          el.addEventListener('blur', () => this.validateField(el));
          el.addEventListener('input', () => this.clearError(el));
        }
      });

      ['ds1', 'ds2', 'ds3'].forEach(id => {
        const el = this.form.querySelector('#' + id);
        if (!el) return;
        el.addEventListener('change', () => {
          if (id === 'ds1') this.validateField(el);
          else this.clearError(el);
        });
      });
    }

    setError(input, msg) {
      const id = input?.id;
      if (!id) return;
      input.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      const err = document.querySelector('#err-' + id);
      if (err) {
        err.textContent = msg || '';
        err.classList.add('is-error');
      }
    }

    clearError(input) {
      const id = input?.id;
      if (!id) return;
      input.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
      const err = document.querySelector('#err-' + id);
      if (err) {
        err.textContent = '';
        err.classList.remove('is-error');
      }
    }

    validators = {
      vorname:  (v) => v.trim().length >= 2 || 'Bitte geben Sie einen gültigen Vornamen ein.',
      nachname: (v) => v.trim().length >= 2 || 'Bitte geben Sie einen gültigen Nachnamen ein.',
      email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Bitte eine gültige E-Mail-Adresse eingeben.',
      telefon:  (v) => {
        if (!v.trim()) return true;
        const clean = v.replace(/[^\d]/g, '');
        const okStart = v.trim().startsWith('+49') || v.trim().startsWith('0');
        const okChars = /^[0-9+\s\-()]+$/.test(v);
        return (okStart && okChars && clean.length >= 7 && clean.length <= 15)
          || 'Bitte eine gültige deutsche Telefonnummer eingeben.';
      },
      quelle:   () => true,
      gehalt:   () => true,
      standort: (v) => (v && v.trim().length > 0) || 'Bitte einen Standort auswählen.',
      files: (files) => {
        const list = Array.from(files || []);
        if (!list.length) return 'Bitte mindestens ein PDF hochladen.';
        for (const f of list) {
          const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
          if (!isPdf) return 'Es sind nur PDF-Dateien erlaubt.';
        }
        const total = list.reduce((s, f) => s + (f?.size || 0), 0);
        if (total > 10 * 1024 * 1024) return 'Die Gesamtgröße aller Dateien darf maximal 10 MB sein.';
        return true;
      },
      checkboxRequired: (checked) => checked || 'Bitte ankreuzen (Pflichtfeld).',
    };

    validateField(el) {
      if (!el) return true;
      const id = el.id;
      let result = true;

      if (id === 'files') {
        result = this.validators.files(this.selectedFiles);
      }
      else if (id === 'ds1') {
        result = this.validators.checkboxRequired(el.checked);
      }
      else if (id === 'ds2' || id === 'ds3') {
        this.clearError(el);
        return true;
      }
      else {
        result = this.validators[id] ? this.validators[id](el.value) : true;
      }

      if (result === true) {
        this.clearError(el);
        return true;
      }

      this.setError(el, result);
      return false;
    }

    validateAll() {
      let isValid = true;

      ['vorname', 'nachname', 'email', 'telefon', 'quelle', 'standort', 'gehalt'].forEach(id => {
        const el = this.form.querySelector('#' + id);
        if (!this.validateField(el)) isValid = false;
      });

      if (!this.validateField(this.fileInput)) isValid = false;

      const ds1 = this.form.querySelector('#ds1');
      if (!this.validateField(ds1)) isValid = false;

      // Honeypot.
      if (this.form.querySelector('#website')?.value?.trim().length > 0) {
        return false;
      }

      return isValid;
    }

    /* ---- Submit ---- */
    scrollToFormStart() {
      const target = this.host || this.form;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const offsetTop = window.pageYOffset + rect.top;
      window.scrollTo({ top: offsetTop - 40, behavior: 'smooth' });
    }

    async handleSubmit(e) {
      e.preventDefault();

      if (!this.validateAll()) {
        this.scrollToFormStart();
        return;
      }

      const fd = new FormData(this.form);

      const btn = this.form.querySelector('#submitBtn');
      const originalBtnText = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Wird gesendet…';
      }

      try {
        const res = await fetch('/api/job-application', {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          const msg = data.message || 'Senden fehlgeschlagen. Bitte später erneut versuchen.';
          alert(msg);
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalBtnText;
          }
          return;
        }

        // Success.
        this.scrollToFormStart();
        const fields = this.form.querySelector('#form-fields');
        const success = this.form.querySelector('#form-success');
        if (fields) fields.style.display = 'none';
        if (success) success.style.display = 'block';

      }
      catch (err) {
        console.error('Form submission error:', err);
        alert('Es ist ein Server- oder Netzwerkfehler aufgetreten. Bitte später erneut versuchen.');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalBtnText;
        }
      }
    }
  }

})(Drupal);
