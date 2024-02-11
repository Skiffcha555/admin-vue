<template>
  <div id="app" class="admin-interface">
    <h1>Admin Interface</h1>
    <div class="editors">
      <simple-code-editor class="code-editor" v-model="vuejsCode" placeholder="Vuejs code"></simple-code-editor>
      <simple-code-editor class="code-editor" v-model="cssCode" placeholder="CSS code"></simple-code-editor>
      <button class="save-btn" @click="saveSettings">Save</button>
    </div>
    <div id="output" class="output">
      <div class="input">
        <div class="data-editor">
          <input type="text" v-model="input.title" placeholder="Card Title">
          <input type="text" v-model="input.imageUrl" placeholder="Image URL">
          <textarea v-model="input.text" placeholder="Card Text"></textarea>
          <button @click="updateData">Update Data</button>
        </div>
      </div>
      <component :is="dynamicComponent" :key="componentKey" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue"
import axios from 'axios';
import SimpleCodeEditor from 'simple-code-editor';

export default {
  components: {
    'simple-code-editor': SimpleCodeEditor
  },
  data() {
    return {
      vuejsCode: '<template></template>',
      cssCode: '',
      compiledVuejsCode: '',
      dynamicComponent: null,
      componentKey: 0,
      input: {
        title: '',
        imageUrl: '',
        text: ''
      }
    };
  },
  mounted() {
    this.applyStyles();
    this.getData();
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
          try {
            this.compileCode();
            this.applyStyles();
          } catch (error) {
            console.log(error);
          }
        })
        .catch((error) => {
          console.error('Error saving settings:', error);
        });
    },
    async compileCode() {
      const content = this.vuejsCode;
      const { loadModule } = window['vue3-sfc-loader'];

      const options = {
        moduleCache: {
          vue: window.Vue,
        },
        async getFile() {
          return content;
        },
        addStyle() { },
      };

      this.dynamicComponent = defineAsyncComponent(async () => {
        const component = await loadModule('/myComponent.vue', options);
        return component
      });

      this.componentKey++;
    },
    applyStyles() {
      document.getElementById('styleElement')?.remove()
      const styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      styleElement.innerHTML = this.cssCode;
      styleElement.id = 'styleElement';
      document.head.appendChild(styleElement);
    },
    getData() {
      fetch('http://localhost:5000/api/data')
        .then((response) => response.json())
        .then((data) => {
          this.input.title = data.title;
          this.input.imageUrl = data.imageUrl;
          this.input.text = data.text;
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    },
    updateData() {
      const updatedData = {
        title: this.input.title,
        imageUrl: this.input.imageUrl,
        text: this.input.text,
      };

      fetch('http://localhost:5000/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          this.compileCode();
          this.applyStyles();
          console.log('Data successfully updated:', data)
        })
        .catch(error => console.error('Error updating data:', error));
    },
  }
};
</script>

<style>
h1 {
  width: 100%;
}

.code-editor .code-area {
  height: 80vh;
}

.code-editor .code-area > textarea {
  height: 100%;
  overflow: auto;
}

.admin-interface {
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.editors {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  width: calc(50% - 10px);
}

.code-editor {
  flex: 1;
  min-width: 250px;
  border: 2px solid purple;
  border-radius: 10px;
  padding: 10px;
}

.save-btn {
  height: fit-content;
  align-self: flex-start;
  padding: 10px 20px;
  margin-top: auto;
  background-color: purple;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

.output {
  width: calc(50% - 10px);
}

#renderTarget {
  border: 2px dashed purple;
  border-radius: 10px;
  width: 100%;
  padding: 20px;
}

.data-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 300px;
}
</style>