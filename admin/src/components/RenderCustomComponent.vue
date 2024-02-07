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
        <h2>Input</h2>
        <input v-model="imgSrc" type="text">
      </div>
      <div id="renderTarget">
      </div>
    </div>
  </div>
</template>

<script>
import { createApp, defineAsyncComponent, h } from "vue"
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
      imgSrc: 'https://kartinki.pics/uploads/posts/2022-12/1670667600_1-kartinkin-net-p-kartinki-ofisa-s-lyudmi-vkontakte-1.jpg',
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
      window.eventBus.emit('update-imgSrc', this.imgSrc);

      axios.post('http://localhost:5000/api/settings', {
        vuejsCode: this.vuejsCode,
        cssCode: this.cssCode
      })
        .then((response) => {
          console.log('Settings saved:', response.data);
          try {
            window.renderTarget.remove()
            const renderTarget = document.createElement('div')
            renderTarget.id = 'renderTarget'
            document.getElementById('output').append(renderTarget)
            
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
  const imgSrc = this.imgSrc; // Предположим, что imgSrc - это пропс, который вы хотите передать
  const { loadModule } = window['vue3-sfc-loader'];

  const options = {
    moduleCache: {
      vue: window.Vue,
    },
    async getFile() {
      // Замените '/myComponent.vue' на ваш фактический путь или ключ для кэширования
      return content;
    },
    addStyle() {},
  };

  // Используйте функциональный подход для определения асинхронного компонента
  const loadComponent = defineAsyncComponent(async () => {
    const component = await loadModule('/myComponent.vue', options);
    // Возвращаем компонент с пропсами
    return {
      ...component,
      props: component.props ? [...component.props, 'imgSrc'] : ['imgSrc'], // Убедитесь, что пропс 'imgSrc' включен в список пропсов компонента
      setup(props) {
        // Здесь можно использовать props.imgSrc и другие пропсы
        return { imgSrc: props.imgSrc };
      },
    };
  });

  // Создание экземпляра приложения Vue с динамическим компонентом и передача пропсов
  const app = createApp({
    render() {
      return h(loadComponent, {
        imgSrc: imgSrc, // Передача imgSrc как пропса
      });
    },
  });

  app.mount('#renderTarget');
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

<style>

h1 {
  width: 100%;
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
</style>