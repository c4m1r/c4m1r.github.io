<template>
  <div style="background: var(--desktop-background); height: calc(100vh - 40px)">
    <ResumeComponent v-show="portfolioBool" @click="handleClickPortfolio($event)" />
    <AboutMeComponent v-show="aboutBool" @click="handleClickAbout($event)" />
    <InfoComponent v-show="infoBool" @click="handleClickInfo($event)" />
    <MusicComponent v-show="musicBool" @click="handleClickMusic($event)" />
    <a2k-desktop>
      <a2k-icon-button
        @dblclick="openPortfolio()"
        icon="documents-icon"
        text="Portfolio"
      ></a2k-icon-button>
      <a2k-icon-button icon="github-icon" @dblclick="openGit()" text="Github"></a2k-icon-button>
      <a2k-icon-button icon="help-icon" text="About" @dblclick="openAbout()"></a2k-icon-button>
      <a2k-icon-button icon="info-icon" text="Info" @dblclick="openInfo()"></a2k-icon-button>
      <a2k-icon-button icon="chevron-icon" text="Music" @dblclick="openMusic()"></a2k-icon-button>
      <!-- <StartButtonContentComponent id="content" /> -->
    </a2k-desktop>
  </div>
</template>

<script>
import ResumeComponent from './ResumeComponent.vue'
import AboutMeComponent from './AboutMeComponent.vue'
import InfoComponent from './InfoComponent.vue'
import MusicComponent from './MusicComponent.vue'
export default {
  components: {
    ResumeComponent,
    AboutMeComponent,
    InfoComponent,
    MusicComponent
  },
  name: 'DesktopComponent',
  data() {
    return {
      portfolioBool: false,
      aboutBool: false,
      infoBool: false,
      musicBool: false
    }
  },
  methods: {
    openPortfolio() {
      this.portfolioBool = true
    },
    openMusic() {
      this.musicBool = true
    },
    openInfo() {
      this.infoBool = true
    },
    openAbout() {
      this.aboutBool = true
    },
    handleClickPortfolio(event) {
      if (event.originalTarget.outerHTML == '<a2k-window-actions></a2k-window-actions>') {
        this.portfolioBool = false
      }
    },
    handleClickInfo(event) {
      if (event.originalTarget.outerHTML == '<a2k-window-actions></a2k-window-actions>') {
        this.infoBool = false
      }
    },
    handleClickAbout(event) {
      if (event.originalTarget.outerHTML == '<a2k-window-actions></a2k-window-actions>') {
        this.aboutBool = false
      }
    },
    handleClickMusic(event) {
      if (event.originalTarget.outerHTML == '<a2k-window-actions></a2k-window-actions>') {
        this.musicBool = false
      }
    },
    openGit() {
      window.open('https://github.com/SamNicklez')
    }
  }
}
</script>
<style scoped>
#content {
  position: fixed; /* Fixed positioning relative to the viewport */
  bottom: 40px; /* 40px above the bottom of the viewport */
  left: 0; /* Aligned to the left side of the viewport */
}
</style>
