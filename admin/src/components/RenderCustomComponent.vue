<template>
  <div id="app">
    <h1>Admin Interface</h1>
    <simple-code-editor v-model="vuejsCode"></simple-code-editor>
    <simple-code-editor v-model="cssCode"></simple-code-editor>
    <button @click="saveSettings">Save</button>
    <div id="renderTarget"></div>
  </div>
</template>

<script>
import { createApp, defineAsyncComponent } from "vue"
import axios from 'axios';
import SimpleCodeEditor from 'simple-code-editor';

export default {
  components: {
    'simple-code-editor': SimpleCodeEditor
  },
  data() {
    return {
      vuejsCode: '<template></template>',
      cssCode: 'div { color: red; }',
      compiledVuejsCode: '',
    };
  },
  mounted() {
    this.applyStyles();
    
  },
  created() {
    this.loadSettings();
  },
  methods: {
    async loadSettings() {
      const response = await axios.get('http://localhost:5000/api/settings')
      this.vuejsCode = response.data.vuejsCode;
      this.cssCode = response.data.cssCode;
      this.compileCode();
      this.applyStyles();

      return response.data
    },
    saveSettings() {
      axios.post('http://localhost:5000/api/settings', {
        vuejsCode: this.vuejsCode,
        cssCode: this.cssCode
      })
        .then((response) => {
          console.log('Settings saved:', response.data);
          this.compileCode();
          this.applyStyles();
        })
        .catch((error) => {
          console.error('Error saving settings:', error);
        });
    },
    async compileCode() {
      const content = this.vuejsCode
      const options = {
        moduleCache: {
          // vue: window.Vue 
        },
        async getFile() {
          return content
        },
        addStyle() {  },
      }

      const { loadModule } = window['vue3-sfc-loader'];
      createApp(defineAsyncComponent(() => loadModule('/myComponent.vue', options)))
        .mount(document.getElementById('renderTarget'));
    },
    applyStyles() {
      const styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      styleElement.innerHTML = this.cssCode;
      document.head.appendChild(styleElement);
    }

  }
};
</script>