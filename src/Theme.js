export default class Theme {
    defaultTheme = 'dark'
  
    constructor() {
      document.addEventListener("DOMContentLoaded", e => { this.onDOMContentLoaded() })
    }
  
    onDOMContentLoaded() {
      let theme = localStorage.getItem('theme')
      if (!theme) {
        theme = this.defaultTheme
      } else {
        console.log('using theme from localStorage: ' + theme)
      }
      this.applyTheme(theme)
    }
  
    toggleDarkMode() {
      let theme = document.documentElement.getAttribute('data-theme')
      if (theme === null)
        theme = this.defaultTheme
  
      if (theme === 'dark') {
        theme = 'light'
      } else {
        theme = 'dark'
      }
      localStorage.setItem('theme', theme)
  
      this.applyTheme(theme)
    }
  
    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }